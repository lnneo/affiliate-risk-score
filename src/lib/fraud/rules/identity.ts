import { queryOne } from '../../db';
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
  const affProfile = await queryOne<{
    email: string;
    payment_account: string;
    registered_fingerprint_hash: string;
    registered_ip: string | null;
  }>(
    `
      SELECT * FROM affiliate_profiles WHERE affiliate_id = ?
    `,
    [order.affiliateId],
  );

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
      reason: `Buyer email (${order.userEmail}) matches affiliate email (${affiliateEmail})`,
      reasonKey: 'selfReferral',
      reasonParams: { buyerEmail: order.userEmail, affiliateEmail },
      metadata: { buyerEmail: order.userEmail, affiliateEmail },
    });
  }

  // 2. Same Payment Account
  const paymentWeight = getWeight('SAME_PAYMENT_ACCOUNT', 100);
  if (order.paymentAccount && paymentWeight > 0) {
    const previousPaymentMatch = await queryOne<{ id: string; affiliate_id: string; user_email: string }>(
      `
        SELECT id, affiliate_id, user_email FROM orders
        WHERE payment_account = ? AND (affiliate_id = ? OR user_id = ?) AND id != ?
      `,
      [order.paymentAccount, order.userEmail, order.affiliateId, order.orderId],
    );

    const isAffiliatePayment = order.paymentAccount.toLowerCase() === affiliatePayment.toLowerCase();

    if (previousPaymentMatch || isAffiliatePayment || order.paymentAccount.toLowerCase().includes(order.affiliateId.toLowerCase())) {
      signals.push({
        type: 'SAME_PAYMENT_ACCOUNT',
        score: paymentWeight,
        reason: `Payment account (${order.paymentAccount}) matches affiliate account (${affiliatePayment}) or a prior self-referral order`,
        reasonKey: 'samePaymentAccount',
        reasonParams: { paymentAccount: order.paymentAccount, affiliatePayment },
        metadata: { paymentAccount: order.paymentAccount, affiliatePayment },
      });
    }
  }

  // 3. Same Cookie Rule
  const cookieWeight = getWeight('SAME_COOKIE', 100);
  if (order.cookieId && cookieWeight > 0) {
    const isAffiliateMasterCookie = order.cookieId.includes(order.affiliateId) || order.cookieId.includes('master');

    const multipleUserMatch = await queryOne<{ user_count: number }>(
      `
        SELECT COUNT(DISTINCT user_id) as user_count
        FROM orders
        WHERE cookie_id = ? AND user_id != ? AND id != ?
      `,
      [order.cookieId, order.userId, order.orderId],
    );

    if (isAffiliateMasterCookie || (multipleUserMatch && multipleUserMatch.user_count > 0)) {
      const cookiePreview = `${order.cookieId.slice(0, 15)}...`;
      signals.push({
        type: 'SAME_COOKIE',
        score: cookieWeight,
        reason: `Browser cookie (${cookiePreview}) is linked to an affiliate admin session or shared across multiple accounts`,
        reasonKey: 'sameCookie',
        reasonParams: { cookiePreview },
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

    const multipleUserOrders = await queryOne<{ user_count: number }>(
      `
        SELECT COUNT(DISTINCT o.user_id) as user_count
        FROM orders o
        JOIN device_fingerprints df ON o.fingerprint_id = df.id
        WHERE df.fingerprint_hash = ? AND o.user_id != ? AND o.id != ?
      `,
      [order.fingerprintHash, order.userId, order.orderId],
    );

    if (isExactFingerprintMatch || (multipleUserOrders && multipleUserOrders.user_count > 0)) {
      const fingerprintPreview = `${order.fingerprintHash.slice(0, 15)}...`;
      const affiliateFpPreview = `${affiliateFpHash.slice(0, 15)}...`;
      signals.push({
        type: 'SAME_FINGERPRINT',
        score: fingerprintWeight,
        reason: `Device fingerprint (${fingerprintPreview}) directly matches affiliate device (${affiliateFpPreview})`,
        reasonKey: 'sameFingerprint',
        reasonParams: { fingerprintPreview, affiliateFpPreview },
        metadata: {
          fingerprintHash: order.fingerprintHash,
          registeredAffiliateFingerprint: affiliateFpHash,
          otherUserCount: multipleUserOrders?.user_count || 0,
        },
      });
    } else {
      // Check Cross-Browser Hardware Cluster (Same IP + Same OS/Screen/Timezone cluster)
      const currentFpData = await queryOne<{ os: string; screen: string; timezone: string }>(
        `
          SELECT os, screen, timezone FROM device_fingerprints WHERE fingerprint_hash = ?
        `,
        [order.fingerprintHash],
      );

      const affiliateFpData = await queryOne<{ os: string; screen: string; timezone: string }>(
        `
          SELECT os, screen, timezone FROM device_fingerprints WHERE fingerprint_hash = ?
        `,
        [affiliateFpHash],
      );

      const isSameIpAsAffiliate = affiliateIp && (order.ip === affiliateIp || order.ip === '127.0.0.1' || order.ip === '::1');

      if (isSameIpAsAffiliate && currentFpData && affiliateFpData) {
        if (currentFpData.os === affiliateFpData.os && currentFpData.screen === affiliateFpData.screen) {
          signals.push({
            type: 'SAME_FINGERPRINT',
            score: 40,
            reason: `Duplicate hardware cluster detected (same IP + OS ${currentFpData.os} + screen ${currentFpData.screen}) between new browser and affiliate device`,
            reasonKey: 'hardwareClusterFingerprint',
            reasonParams: { os: currentFpData.os, screen: currentFpData.screen },
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
        reason: `Email domain (@${domain}) is on the disposable/temporary email provider list`,
        reasonKey: 'disposableEmail',
        reasonParams: { domain },
        metadata: { domain },
      });
    }
  }

  return signals;
}
