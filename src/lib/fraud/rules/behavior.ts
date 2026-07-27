import { db } from '../../db';
import { FraudSignal, OrderContext, RuleConfig } from '../types';

export async function evaluateBehaviorRules(
  order: OrderContext,
  ruleConfigs: Map<string, RuleConfig>
): Promise<FraudSignal[]> {
  const signals: FraudSignal[] = [];

  const getWeight = (type: string, defaultWeight: number) => {
    const config = ruleConfigs.get(type);
    if (config && !config.enabled) return 0;
    return config ? config.weight : defaultWeight;
  };

  const velocityWeight = getWeight('VELOCITY_EXCEEDED', 20);
  if (velocityWeight > 0) {
    // Check orders count from same IP in last 10 minutes
    const ipVelocity = db.prepare(`
      SELECT COUNT(*) as count FROM orders 
      WHERE ip = ? AND datetime(created_at) >= datetime('now', '-10 minutes')
    `).get(order.ip) as { count: number };

    // Check clicks count for this affiliate in last 5 minutes
    const clickVelocity = db.prepare(`
      SELECT COUNT(*) as count FROM affiliate_clicks 
      WHERE affiliate_id = ? AND datetime(clicked_at) >= datetime('now', '-5 minutes')
    `).get(order.affiliateId) as { count: number };

    if ((ipVelocity && ipVelocity.count >= 3) || (clickVelocity && clickVelocity.count >= 10)) {
      signals.push({
        type: 'VELOCITY_EXCEEDED',
        score: velocityWeight,
        reason: `High velocity detected: ${ipVelocity?.count || 0} orders from IP ${order.ip} within 10 minutes`,
        metadata: {
          ordersLast10Min: ipVelocity?.count || 0,
          clicksLast5Min: clickVelocity?.count || 0,
        },
      });
    }
  }

  return signals;
}
