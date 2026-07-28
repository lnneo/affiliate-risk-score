import { execute, queryMany, queryOne } from '../db';
import { fraudSignalPersistMetadata } from '../../i18n/format';
import { evaluateIdentityRules } from './rules/identity';
import { evaluateNetworkRules } from './rules/network';
import { evaluateBehaviorRules } from './rules/behavior';
import { evaluateAdvancedTapfiliateRules } from './rules/advanced-tapfiliate';
import { FraudSignal, OrderContext, RiskDecision, RiskEvaluationResult, RuleConfig } from './types';
import { randomUUID } from 'crypto';

export async function evaluateOrderRisk(order: OrderContext): Promise<RiskEvaluationResult> {
  // 1. Fetch active rule configurations from database
  const dbRules = await queryMany<{
    rule_type: string;
    score_weight: number;
    enabled: number;
    description: string;
  }>('SELECT * FROM rule_configs');
  const ruleConfigs = new Map<string, RuleConfig>();
  
  for (const r of dbRules) {
    ruleConfigs.set(r.rule_type, {
      type: r.rule_type,
      weight: r.score_weight,
      enabled: r.enabled === 1,
      description: r.description,
    });
  }

  // 2. Run all fraud rule evaluators (Identity, Network, Behavior, Advanced Tapfiliate)
  const identitySignals = await evaluateIdentityRules(order, ruleConfigs);
  const networkSignals = await evaluateNetworkRules(order, ruleConfigs);
  const behaviorSignals = await evaluateBehaviorRules(order, ruleConfigs);
  const advancedSignals = await evaluateAdvancedTapfiliateRules(order, ruleConfigs);

  const allSignals: FraudSignal[] = [
    ...identitySignals,
    ...networkSignals,
    ...behaviorSignals,
    ...advancedSignals,
  ];

  // 3. Calculate total score
  const totalScore = allSignals.reduce((sum, s) => sum + s.score, 0);

  // 4. Determine Risk Decision based on thresholds
  let decision: RiskDecision = 'APPROVE';
  if (totalScore >= 100) {
    decision = 'REJECT';
  } else if (totalScore >= 70) {
    decision = 'MANUAL_REVIEW';
  } else if (totalScore >= 40) {
    decision = 'PENDING_REVIEW';
  }

  const riskScoreId = `risk_${randomUUID()}`;

  // 5. Persist order if not already in DB
  const existingOrder = await queryOne<{ id: string }>('SELECT id FROM orders WHERE id = ?', [order.orderId]);
  if (!existingOrder) {
    let fingerprintDbId: string | null = null;
    if (order.fingerprintHash) {
      const fp = await queryOne<{ id: string }>(
        'SELECT id FROM device_fingerprints WHERE fingerprint_hash = ?',
        [order.fingerprintHash],
      );
      if (fp) fingerprintDbId = fp.id;
    }

    await execute(`
      INSERT INTO orders (id, user_id, user_email, payment_account, affiliate_id, amount, cookie_id, fingerprint_id, ip, country, external_customer_id, is_vpn, is_datacenter, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      order.orderId,
      order.userId,
      order.userEmail,
      order.paymentAccount,
      order.affiliateId,
      order.amount,
      order.cookieId || null,
      fingerprintDbId,
      order.ip,
      order.country || 'US',
      order.externalCustomerId || null,
      order.isVpn ? 1 : 0,
      order.isDatacenter ? 1 : 0,
      order.createdAt || new Date().toISOString(),
    ]);
  }

  // 6. Persist risk score decision
  await execute(`
    INSERT INTO affiliate_risk_scores (id, order_id, user_id, affiliate_id, total_score, decision, review_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'UNREVIEWED', CURRENT_TIMESTAMP)
  `, [
    riskScoreId,
    order.orderId,
    order.userId,
    order.affiliateId,
    totalScore,
    decision,
  ]);

  // 7. Persist individual signals (Explainable Audit Log)
  for (const sig of allSignals) {
    const persistMeta = fraudSignalPersistMetadata(sig);
    await execute(
      `
        INSERT INTO affiliate_risk_signals (id, risk_score_id, signal_type, score, reason, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        `sig_${randomUUID()}`,
        riskScoreId,
        sig.type,
        sig.score,
        sig.reason,
        persistMeta ? JSON.stringify(persistMeta) : null,
      ],
    );
  }

  return {
    riskScoreId,
    orderId: order.orderId,
    userId: order.userId,
    affiliateId: order.affiliateId,
    totalScore,
    decision,
    signals: allSignals,
    thresholds: {
      approveMax: 39,
      pendingMax: 69,
      manualReviewMax: 99,
    },
  };
}
