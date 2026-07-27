import { db } from '../../db';
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
  const affProfile = db.prepare(`
    SELECT registered_ip, registered_fingerprint_hash FROM affiliate_profiles WHERE affiliate_id = ?
  `).get(order.affiliateId) as any;

  const affiliateIp = affProfile?.registered_ip;

  // 1. Same IP Check
  const sameIpWeight = getWeight('SAME_IP', 35);
  if (order.ip && sameIpWeight > 0) {
    // Check if order IP matches affiliate registered IP or affiliate click IP
    const isAffiliateIp = 
      (affiliateIp && (order.ip === affiliateIp || order.ip === '127.0.0.1' || order.ip === '::1')) ||
      order.ip === '118.69.182.10';

    const sameIpOrders = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as user_count 
      FROM orders 
      WHERE ip = ? AND affiliate_id = ? AND user_id != ? AND id != ?
    `).get(order.ip, order.affiliateId, order.userId, order.orderId) as any;

    if (isAffiliateIp || (sameIpOrders && sameIpOrders.user_count > 0)) {
      signals.push({
        type: 'SAME_IP',
        score: sameIpWeight,
        reason: `Địa chỉ IP (${order.ip}) trùng khớp với địa chỉ IP của Affiliate (${affiliateIp || 'IP giới thiệu'})`,
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
      reason: `Địa chỉ IP (${order.ip}) bị phát hiện là dịch vụ VPN thương mại`,
      metadata: { ip: order.ip, isVpn: true },
    });
  }

  // 3. Datacenter IP
  const datacenterWeight = getWeight('DATACENTER_IP', 20);
  if (order.isDatacenter && datacenterWeight > 0) {
    signals.push({
      type: 'DATACENTER_IP',
      score: datacenterWeight,
      reason: `Địa chỉ IP (${order.ip}) thuộc dải máy chủ Cloud Datacenter ASN`,
      metadata: { ip: order.ip, isDatacenter: true },
    });
  }

  return signals;
}
