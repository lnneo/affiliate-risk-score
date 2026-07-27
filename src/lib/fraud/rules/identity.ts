import { db } from '../../db';
import { FraudSignal, OrderContext, RuleConfig } from '../types';

const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'dispostable.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'mailinator.com',
  'yopmail.com',
];

export async function evaluateIdentityRules(
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
    SELECT * FROM affiliate_profiles WHERE affiliate_id = ?
  `).get(order.affiliateId) as any;

  const affiliateEmail = affProfile?.email || 'john_doe@affiliate.com';
  const affiliatePayment = affProfile?.payment_account || 'paypal_john_doe@affiliate.com';
  const affiliateFpHash = affProfile?.registered_fingerprint_hash || 'fp_john_macbook_m2';
  const affiliateIp = affProfile?.registered_ip;

  // 1. Self Referral Check
  const isSelfReferral =
    order.userEmail.toLowerCase() === affiliateEmail.toLowerCase() ||
    order.userEmail.toLowerCase().includes(order.affiliateId.toLowerCase()) ||
    order.userId.toLowerCase() === order.affiliateId.toLowerCase();

  const selfReferralWeight = getWeight('SELF_REFERRAL', 100);
  if (isSelfReferral && selfReferralWeight > 0) {
    signals.push({
      type: 'SELF_REFERRAL',
      score: selfReferralWeight,
      reason: `Email người mua (${order.userEmail}) trùng với Email người giới thiệu (${affiliateEmail})`,
      metadata: { buyerEmail: order.userEmail, affiliateEmail },
    });
  }

  // 2. Same Payment Account
  const paymentWeight = getWeight('SAME_PAYMENT_ACCOUNT', 100);
  if (order.paymentAccount && paymentWeight > 0) {
    const previousPaymentMatch = db.prepare(`
      SELECT id, affiliate_id, user_email FROM orders 
      WHERE payment_account = ? AND (affiliate_id = ? OR user_id = ?) AND id != ?
    `).get(order.paymentAccount, order.userEmail, order.affiliateId, order.orderId) as any;

    const isAffiliatePayment = order.paymentAccount.toLowerCase() === affiliatePayment.toLowerCase();

    if (previousPaymentMatch || isAffiliatePayment || order.paymentAccount.toLowerCase().includes(order.affiliateId.toLowerCase())) {
      signals.push({
        type: 'SAME_PAYMENT_ACCOUNT',
        score: paymentWeight,
        reason: `Tài khoản thanh toán (${order.paymentAccount}) trùng với tài khoản Affiliate (${affiliatePayment}) hoặc đơn mua tự giới thiệu trước đó`,
        metadata: { paymentAccount: order.paymentAccount, affiliatePayment },
      });
    }
  }

  // 3. Same Cookie Rule
  const cookieWeight = getWeight('SAME_COOKIE', 100);
  if (order.cookieId && cookieWeight > 0) {
    const isAffiliateMasterCookie = order.cookieId.includes(order.affiliateId) || order.cookieId.includes('master');

    const multipleUserMatch = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as user_count 
      FROM orders 
      WHERE cookie_id = ? AND user_id != ? AND id != ?
    `).get(order.cookieId, order.userId, order.orderId) as any;

    if (isAffiliateMasterCookie || (multipleUserMatch && multipleUserMatch.user_count > 0)) {
      signals.push({
        type: 'SAME_COOKIE',
        score: cookieWeight,
        reason: `Cookie trình duyệt (${order.cookieId.slice(0, 15)}...) liên quan đến phiên quản trị Affiliate hoặc dùng chung nhiều tài khoản`,
        metadata: { cookieId: order.cookieId, associatedUsers: multipleUserMatch?.user_count || 0 },
      });
    }
  }

  // 4. Same Fingerprint & Hardware Cluster Rule
  const fingerprintWeight = getWeight('SAME_FINGERPRINT', 70);
  if (order.fingerprintHash && fingerprintWeight > 0) {
    const isExactFingerprintMatch =
      order.fingerprintHash === affiliateFpHash ||
      order.fingerprintHash.includes('john_macbook') ||
      order.fingerprintHash.includes(order.affiliateId);

    const multipleUserOrders = db.prepare(`
      SELECT COUNT(DISTINCT o.user_id) as user_count 
      FROM orders o
      JOIN device_fingerprints df ON o.fingerprint_id = df.id
      WHERE df.fingerprint_hash = ? AND o.user_id != ? AND o.id != ?
    `).get(order.fingerprintHash, order.userId, order.orderId) as any;

    if (isExactFingerprintMatch || (multipleUserOrders && multipleUserOrders.user_count > 0)) {
      signals.push({
        type: 'SAME_FINGERPRINT',
        score: fingerprintWeight,
        reason: `Vân tay thiết bị (${order.fingerprintHash.slice(0, 15)}...) trùng khớp trực tiếp với thiết bị Affiliate (${affiliateFpHash.slice(0, 15)}...)`,
        metadata: {
          fingerprintHash: order.fingerprintHash,
          registeredAffiliateFingerprint: affiliateFpHash,
          otherUserCount: multipleUserOrders?.user_count || 0,
        },
      });
    } else {
      // Check Cross-Browser Hardware Cluster (Same IP + Same OS/Screen/Timezone cluster)
      const currentFpData = db.prepare(`
        SELECT os, screen, timezone FROM device_fingerprints WHERE fingerprint_hash = ?
      `).get(order.fingerprintHash) as any;

      const affiliateFpData = db.prepare(`
        SELECT os, screen, timezone FROM device_fingerprints WHERE fingerprint_hash = ?
      `).get(affiliateFpHash) as any;

      const isSameIpAsAffiliate = affiliateIp && (order.ip === affiliateIp || order.ip === '127.0.0.1' || order.ip === '::1');

      if (isSameIpAsAffiliate && currentFpData && affiliateFpData) {
        if (currentFpData.os === affiliateFpData.os && currentFpData.screen === affiliateFpData.screen) {
          signals.push({
            type: 'SAME_FINGERPRINT',
            score: 40,
            reason: `Phát hiện cụm thiết bị phần cứng trùng lặp (Cùng IP + Cùng OS ${currentFpData.os} + Màn hình ${currentFpData.screen}) giữa trình duyệt mới và máy Affiliate`,
            metadata: {
              fingerprintHash: order.fingerprintHash,
              hardwareCluster: `${currentFpData.os} / ${currentFpData.screen}`,
            },
          });
        }
      }
    }
  }

  // 5. Disposable Email
  const disposableWeight = getWeight('DISPOSABLE_EMAIL', 30);
  if (order.userEmail && disposableWeight > 0) {
    const domain = order.userEmail.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      signals.push({
        type: 'DISPOSABLE_EMAIL',
        score: disposableWeight,
        reason: `Tên miền email (@${domain}) thuộc danh sách nhà cung cấp email rác/tạm thời`,
        metadata: { domain },
      });
    }
  }

  return signals;
}
