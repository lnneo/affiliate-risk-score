import { db } from '../../db';
import { FraudSignal, OrderContext, RuleConfig } from '../types';

const HIGH_RISK_COUNTRIES = ['KP', 'RU', 'IR', 'BY', 'SY'];

// Helper to check if an IP matches exact IP or dynamic wildcard pattern (e.g. 198.51.100.* or 198.51.*.*)
function checkIpBlacklist(clientIp: string): { isBlacklisted: boolean; matchedPattern?: string; reason?: string } | null {
  if (!clientIp) return null;
  const blacklistedIps = db.prepare(`SELECT value, reason FROM blacklisted_attributes WHERE type = 'IP'`).all() as any[];

  for (const item of blacklistedIps) {
    const pattern = item.value.trim();
    if (pattern.includes('*')) {
      // Escape dots, replace * with \d+ or [0-9]+
      const regexStr = '^' + pattern.split('.').map((part: string) => (part === '*' ? '\\d+' : part)).join('\\.') + '$';
      const regex = new RegExp(regexStr);
      if (regex.test(clientIp)) {
        return { isBlacklisted: true, matchedPattern: item.value, reason: item.reason };
      }
    } else if (pattern === clientIp) {
      return { isBlacklisted: true, matchedPattern: item.value, reason: item.reason };
    }
  }

  return null;
}

export async function evaluateAdvancedTapfiliateRules(
  order: OrderContext,
  ruleConfigs: Map<string, RuleConfig>
): Promise<FraudSignal[]> {
  const signals: FraudSignal[] = [];

  const getWeight = (type: string, defaultWeight: number) => {
    const config = ruleConfigs.get(type);
    if (config && !config.enabled) return 0;
    return config ? config.weight : defaultWeight;
  };

  // 1. Dynamic IP Blacklisting Rule (Supports Wildcards like 198.51.100.* or 198.51.*.*)
  const ipBlacklistWeight = getWeight('IP_BLACKLISTED', 100);
  if (order.ip && ipBlacklistWeight > 0) {
    const blacklistMatch = checkIpBlacklist(order.ip);

    if (blacklistMatch?.isBlacklisted) {
      signals.push({
        type: 'IP_BLACKLISTED',
        score: ipBlacklistWeight,
        reason: `Địa chỉ IP (${order.ip}) khớp với dải IP Đen động (${blacklistMatch.matchedPattern}): ${blacklistMatch.reason || 'IP nguy hiểm'}`,
        metadata: { ip: order.ip, matchedPattern: blacklistMatch.matchedPattern, reason: blacklistMatch.reason },
      });
    }
  }

  // 2. Referrer Spam & Cloaking Rule
  const referrerWeight = getWeight('REFERRER_SPAM_OR_CLOAKED', 30);
  if (order.referrer && referrerWeight > 0) {
    const referrerStr = order.referrer.toLowerCase();
    
    // Check if referrer domain is blacklisted
    const blacklistedDomain = db.prepare(`
      SELECT value, reason FROM blacklisted_attributes WHERE type = 'DOMAIN' AND ? LIKE '%' || value || '%'
    `).get(referrerStr) as any;

    if (blacklistedDomain) {
      signals.push({
        type: 'REFERRER_SPAM_OR_CLOAKED',
        score: referrerWeight,
        reason: `Trang giới thiệu (${order.referrer}) thuộc mạng lưới Referrer Spam / Cloaking bị cấm: ${blacklistedDomain.reason}`,
        metadata: { referrer: order.referrer, blacklistedDomain: blacklistedDomain.value },
      });
    } else if (referrerStr.includes('noreferrer') || referrerStr.includes('anonymous')) {
      signals.push({
        type: 'REFERRER_SPAM_OR_CLOAKED',
        score: referrerWeight,
        reason: `Chuỗi Referrer dùng kỹ thuật ẩn giấu nguồn traffic (Url Cloaking)`,
        metadata: { referrer: order.referrer },
      });
    }
  }

  // 3. Suspicious Geolocation Rule
  const geoWeight = getWeight('SUSPICIOUS_GEOLOCATION', 30);
  if (order.country && geoWeight > 0) {
    if (HIGH_RISK_COUNTRIES.includes(order.country.toUpperCase())) {
      signals.push({
        type: 'SUSPICIOUS_GEOLOCATION',
        score: geoWeight,
        reason: `Lượt nhấp/mua hàng đến từ quốc gia rủi ro cao (${order.country}) nằm ngoài thị trường mục tiêu`,
        metadata: { country: order.country },
      });
    }
  }

  // 4. Click Inflation / Zero-Conversion Click Spam Rule
  const clickInflationWeight = getWeight('CLICK_INFLATION_NO_CONVERSION', 30);
  if (clickInflationWeight > 0) {
    const clicksLast24h = db.prepare(`
      SELECT COUNT(*) as count FROM affiliate_clicks 
      WHERE affiliate_id = ? AND datetime(clicked_at) >= datetime('now', '-24 hours')
    `).get(order.affiliateId) as { count: number };

    const ordersLast24h = db.prepare(`
      SELECT COUNT(*) as count FROM orders 
      WHERE affiliate_id = ? AND datetime(created_at) >= datetime('now', '-24 hours')
    `).get(order.affiliateId) as { count: number };

    if (clicksLast24h && clicksLast24h.count >= 50 && (ordersLast24h?.count || 0) === 0) {
      signals.push({
        type: 'CLICK_INFLATION_NO_CONVERSION',
        score: clickInflationWeight,
        reason: `Affiliate tạo ra ${clicksLast24h.count} lượt click trong 24h nhưng tỷ lệ chuyển đổi = 0% (Spam CTR ảo)`,
        metadata: { clicks24h: clicksLast24h.count, conversions24h: ordersLast24h?.count || 0 },
      });
    }
  }

  // 5. Duplicate Conversion Check (customer_id / external_id)
  const duplicateWeight = getWeight('DUPLICATE_CONVERSION', 100);
  if (order.externalCustomerId && duplicateWeight > 0) {
    const existingConversion = db.prepare(`
      SELECT id, affiliate_id, created_at FROM orders 
      WHERE external_customer_id = ? AND id != ?
    `).get(order.externalCustomerId, order.orderId) as any;

    if (existingConversion) {
      signals.push({
        type: 'DUPLICATE_CONVERSION',
        score: duplicateWeight,
        reason: `Mã khách hàng/đơn hàng (${order.externalCustomerId}) đã được ghi nhận hoa hồng trước đó`,
        metadata: { externalCustomerId: order.externalCustomerId, previousOrderId: existingConversion.id },
      });
    }
  }

  return signals;
}
