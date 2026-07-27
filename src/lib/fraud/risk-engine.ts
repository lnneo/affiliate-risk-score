import { db } from '../db';
import { evaluateIdentityRules } from './rules/identity';
import { evaluateNetworkRules } from './rules/network';
import { evaluateBehaviorRules } from './rules/behavior';
import { evaluateAdvancedTapfiliateRules } from './rules/advanced-tapfiliate';
import { FraudSignal, OrderContext, RiskDecision, RiskEvaluationResult, RuleConfig } from './types';
import { randomUUID } from 'crypto';

export async function evaluateOrderRisk(order: OrderContext): Promise<RiskEvaluationResult> {
  // 1. Fetch active rule configurations from database
  const dbRules = db.prepare('SELECT * FROM rule_configs').all() as any[];
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
  const existingOrder = db.prepare('SELECT id FROM orders WHERE id = ?').get(order.orderId);
  if (!existingOrder) {
    let fingerprintDbId: string | null = null;
    if (order.fingerprintHash) {
      const fp = db.prepare('SELECT id FROM device_fingerprints WHERE fingerprint_hash = ?').get(order.fingerprintHash) as any;
      if (fp) fingerprintDbId = fp.id;
    }

    db.prepare(`
      INSERT INTO orders (id, user_id, user_email, payment_account, affiliate_id, amount, cookie_id, fingerprint_id, ip, country, external_customer_id, is_vpn, is_datacenter, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
      order.createdAt || new Date().toISOString()
    );
  }

  // 6. Persist risk score decision
  db.prepare(`
    INSERT INTO affiliate_risk_scores (id, order_id, user_id, affiliate_id, total_score, decision, review_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'UNREVIEWED', CURRENT_TIMESTAMP)
  `).run(
    riskScoreId,
    order.orderId,
    order.userId,
    order.affiliateId,
    totalScore,
    decision
  );

  // 7. Persist individual signals (Explainable Audit Log)
  const insertSignal = db.prepare(`
    INSERT INTO affiliate_risk_signals (id, risk_score_id, signal_type, score, reason, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const sig of allSignals) {
    insertSignal.run(
      `sig_${randomUUID()}`,
      riskScoreId,
      sig.type,
      sig.score,
      sig.reason,
      sig.metadata ? JSON.stringify(sig.metadata) : null
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
