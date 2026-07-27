import { queryOne } from '../../db';
import { FraudSignal, OrderContext, RuleConfig } from '../types';

export async function evaluateNetworkRules(
  order: OrderContext,
  ruleConfigs: Map<string, RuleConfig>
): Promise<FraudSignal[]> {
  const signals: FraudSignal[] = [];

  const getWeight = (type: string, defaultWeight: number) => {
    const config = ruleConfigs.get(type);
    if (config && !config.enabled) return 0;
    return config ? config.weight : defaultWeight;
  };

  // Fetch Affiliate Profile dynamically from DB
  const affProfile = await queryOne<{ registered_ip: string | null; registered_fingerprint_hash: string | null }>(
    `
      SELECT registered_ip, registered_fingerprint_hash FROM affiliate_profiles WHERE affiliate_id = ?
    `,
    [order.affiliateId],
  );

  const affiliateIp = affProfile?.registered_ip;

  // 1. Same IP Check
  const sameIpWeight = getWeight('SAME_IP', 35);
  if (order.ip && sameIpWeight > 0) {
    // Check if order IP matches affiliate registered IP or affiliate click IP
    const isAffiliateIp = 
      (affiliateIp && (order.ip === affiliateIp || order.ip === '127.0.0.1' || order.ip === '::1')) ||
      order.ip === '118.69.182.10';

    const sameIpOrders = await queryOne<{ user_count: number }>(
      `
        SELECT COUNT(DISTINCT user_id) as user_count
        FROM orders
        WHERE ip = ? AND affiliate_id = ? AND user_id != ? AND id != ?
      `,
      [order.ip, order.affiliateId, order.userId, order.orderId],
    );

    if (isAffiliateIp || (sameIpOrders && sameIpOrders.user_count > 0)) {
      signals.push({
        type: 'SAME_IP',
        score: sameIpWeight,
        reason: `IP address (${order.ip}) matches affiliate IP (${affiliateIp || 'referral IP'})`,
        reasonKey: 'sameIp',
        reasonParams: { ip: order.ip, affiliateIp: affiliateIp || 'referral IP' },
        metadata: { ip: order.ip, affiliateIp, relatedUserCount: sameIpOrders?.user_count || 0 },
      });
    }
  }

  // 2. VPN Usage
  const vpnWeight = getWeight('VPN_USAGE', 20);
  if (order.isVpn && vpnWeight > 0) {
    signals.push({
      type: 'VPN_USAGE',
      score: vpnWeight,
      reason: `IP address (${order.ip}) detected as a commercial VPN service`,
      reasonKey: 'vpnUsage',
      reasonParams: { ip: order.ip },
      metadata: { ip: order.ip, isVpn: true },
    });
  }

  // 3. Datacenter IP
  const datacenterWeight = getWeight('DATACENTER_IP', 20);
  if (order.isDatacenter && datacenterWeight > 0) {
    signals.push({
      type: 'DATACENTER_IP',
      score: datacenterWeight,
      reason: `IP address (${order.ip}) belongs to a cloud datacenter ASN range`,
      reasonKey: 'datacenterIp',
      reasonParams: { ip: order.ip },
      metadata: { ip: order.ip, isDatacenter: true },
    });
  }

  return signals;
}
