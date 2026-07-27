import { NextResponse } from 'next/server';
import { execute, initDatabase } from '@/lib/db';
import { evaluateOrderRisk } from '@/lib/fraud/risk-engine';

export async function POST() {
  try {
    await initDatabase();

    // Reset tables
    await execute('DELETE FROM affiliate_risk_signals');
    await execute('DELETE FROM affiliate_risk_scores');
    await execute('DELETE FROM orders');
    await execute('DELETE FROM affiliate_clicks');
    await execute('DELETE FROM device_fingerprints');

    // 1. Seed Fingerprints
    const fpAffiliate = 'fp_john_macbook_m2';
    const fpBuyerClean = 'fp_buyer_alice_macbook';

    await execute(`
      INSERT INTO device_fingerprints (id, fingerprint_hash, browser, browser_version, os, timezone, language, screen)
      VALUES ('fp_1', ?, 'Chrome', '120.0', 'macOS', 'Asia/Ho_Chi_Minh', 'vi-VN', '2560x1600')
    `, [fpAffiliate]);

    await execute(`
      INSERT INTO device_fingerprints (id, fingerprint_hash, browser, browser_version, os, timezone, language, screen)
      VALUES ('fp_2', ?, 'Safari', '17.2', 'macOS', 'America/New_York', 'en-US', '1920x1080')
    `, [fpBuyerClean]);

    // 2. Seed Affiliate Clicks
    await execute(`
      INSERT INTO affiliate_clicks (id, affiliate_id, cookie_id, session_id, fingerprint_id, ip, country, referrer, clicked_at)
      VALUES ('clk_1', 'aff_john_doe', 'ck_john_master_session', 'sess_111', 'fp_1', '118.69.182.10', 'VN', 'https://techblog.com/review', CURRENT_TIMESTAMP)
    `);

    await execute(`
      INSERT INTO affiliate_clicks (id, affiliate_id, cookie_id, session_id, fingerprint_id, ip, country, referrer, clicked_at)
      VALUES ('clk_2', 'aff_john_doe', 'ck_alice_clean_session', 'sess_222', 'fp_2', '24.180.12.99', 'US', 'https://google.com', CURRENT_TIMESTAMP)
    `);

    // 3. Seed Fraud Orders
    // Case 1: Clean Order (0 pts -> APPROVE)
    await evaluateOrderRisk({
      orderId: 'ord_demo_clean_alice',
      userId: 'usr_alice_smith',
      userEmail: 'alice.smith@gmail.com',
      paymentAccount: 'card_visa_9841',
      affiliateId: 'aff_john_doe',
      amount: 149.00,
      cookieId: 'ck_alice_clean_session',
      fingerprintHash: fpBuyerClean,
      ip: '24.180.12.99',
      country: 'US',
      referrer: 'https://google.com',
      externalCustomerId: 'cust_alice_101',
      isVpn: false,
      isDatacenter: false,
    });

    // Case 2: Direct Self-Referral (100 pts -> REJECT)
    await evaluateOrderRisk({
      orderId: 'ord_demo_self_referral',
      userId: 'aff_john_doe',
      userEmail: 'john_doe@affiliate.com',
      paymentAccount: 'paypal_john_doe@affiliate.com',
      affiliateId: 'aff_john_doe',
      amount: 299.00,
      cookieId: 'ck_john_master_session',
      fingerprintHash: fpAffiliate,
      ip: '118.69.182.10',
      country: 'VN',
      referrer: 'https://techblog.com/review',
      externalCustomerId: 'cust_john_self',
      isVpn: false,
      isDatacenter: false,
    });

    // Case 3: Blacklisted IP (100 pts -> REJECT)
    await evaluateOrderRisk({
      orderId: 'ord_demo_blacklisted_ip',
      userId: 'usr_bad_actor',
      userEmail: 'bad.actor@example.com',
      paymentAccount: 'card_bad_9910',
      affiliateId: 'aff_john_doe',
      amount: 99.00,
      cookieId: 'ck_bad_session_99',
      fingerprintHash: 'fp_bad_actor_device',
      ip: '198.51.100.99', // Blacklisted IP
      country: 'US',
      referrer: 'https://spam-ad-network.biz/redirect',
      externalCustomerId: 'cust_bad_actor',
      isVpn: false,
      isDatacenter: false,
    });

    // Case 4: Duplicate Conversion (100 pts -> REJECT)
    await evaluateOrderRisk({
      orderId: 'ord_demo_duplicate_conversion',
      userId: 'usr_repeat_claim',
      userEmail: 'repeat.claim@gmail.com',
      paymentAccount: 'card_visa_0012',
      affiliateId: 'aff_john_doe',
      amount: 199.00,
      cookieId: 'ck_repeat_session',
      fingerprintHash: 'fp_repeat_device',
      ip: '203.0.113.44',
      country: 'US',
      referrer: 'https://google.com',
      externalCustomerId: 'cust_alice_101', // Duplicate customer ID!
      isVpn: false,
      isDatacenter: false,
    });

    // Case 5: Suspicious Geolocation + Datacenter (50 pts -> PENDING_REVIEW)
    await evaluateOrderRisk({
      orderId: 'ord_demo_geo_datacenter',
      userId: 'usr_high_risk_geo',
      userEmail: 'risk_user@tempmail.com',
      paymentAccount: 'card_risk_5544',
      affiliateId: 'aff_john_doe',
      amount: 499.00,
      cookieId: 'ck_risk_geo_session',
      fingerprintHash: 'fp_risk_geo_device',
      ip: '185.220.101.5',
      country: 'RU', // High risk GEO
      referrer: 'https://noreferrer.com',
      externalCustomerId: 'cust_risk_geo_99',
      isVpn: false,
      isDatacenter: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded demo fraud scenarios into SQLite database!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
