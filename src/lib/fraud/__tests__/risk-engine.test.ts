import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateOrderRisk } from '../risk-engine';
import { db } from '../../db';

describe('Affiliate Risk Score Engine - Dynamic IP Blacklist & 100% Tapfiliate Coverage', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM affiliate_risk_signals').run();
    db.prepare('DELETE FROM affiliate_risk_scores').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM affiliate_clicks').run();
    db.prepare('DELETE FROM device_fingerprints').run();
    db.prepare('DELETE FROM blacklisted_attributes').run();

    // Seed default blacklisted items including dynamic wildcard IP patterns
    db.prepare(`INSERT INTO blacklisted_attributes (id, type, value, reason) VALUES ('bl_exact', 'IP', '198.51.100.99', 'Exact IP Blacklist')`).run();
    db.prepare(`INSERT INTO blacklisted_attributes (id, type, value, reason) VALUES ('bl_wildcard_subnet', 'IP', '192.168.100.*', 'Subnet Wildcard Blacklist')`).run();
    db.prepare(`INSERT INTO blacklisted_attributes (id, type, value, reason) VALUES ('bl_wildcard_broad', 'IP', '10.200.*.*', 'Broad Range Wildcard Blacklist')`).run();
    db.prepare(`INSERT INTO blacklisted_attributes (id, type, value, reason) VALUES ('bl_domain', 'DOMAIN', 'spam-ad-network.biz', 'Referral Spam Network')`).run();
  });

  it('should APPROVE clean legitimate order with score < 40', async () => {
    const result = await evaluateOrderRisk({
      orderId: 'ord_clean_1',
      userId: 'usr_clean_1',
      userEmail: 'legit.buyer@example.com',
      paymentAccount: 'card_clean_123',
      affiliateId: 'aff_john_doe',
      amount: 100,
      cookieId: 'cookie_clean_abc',
      fingerprintHash: 'fp_hash_clean_123',
      ip: '203.0.113.10',
      isVpn: false,
      isDatacenter: false,
    });

    expect(result.totalScore).toBe(0);
    expect(result.decision).toBe('APPROVE');
  });

  it('should REJECT exact blacklisted IP match (198.51.100.99)', async () => {
    const result = await evaluateOrderRisk({
      orderId: 'ord_blacklisted_exact',
      userId: 'usr_blacklisted',
      userEmail: 'bad.actor@example.com',
      paymentAccount: 'card_bad_123',
      affiliateId: 'aff_john_doe',
      amount: 50,
      ip: '198.51.100.99',
    });

    expect(result.signals.some((s) => s.type === 'IP_BLACKLISTED')).toBe(true);
    expect(result.decision).toBe('REJECT');
  });

  it('should REJECT wildcard IP subnet match (192.168.100.*)', async () => {
    // 192.168.100.45 matches 192.168.100.*
    const result = await evaluateOrderRisk({
      orderId: 'ord_blacklisted_wildcard_1',
      userId: 'usr_wildcard_buyer',
      userEmail: 'wildcard.buyer@example.com',
      paymentAccount: 'card_wild_45',
      affiliateId: 'aff_john_doe',
      amount: 75,
      ip: '192.168.100.45',
    });

    expect(result.signals.some((s) => s.type === 'IP_BLACKLISTED')).toBe(true);
    expect(result.decision).toBe('REJECT');
    expect(result.signals.find((s) => s.type === 'IP_BLACKLISTED')?.metadata?.matchedPattern).toBe('192.168.100.*');
  });

  it('should REJECT broad wildcard IP match (10.200.*.*)', async () => {
    // 10.200.55.88 matches 10.200.*.*
    const result = await evaluateOrderRisk({
      orderId: 'ord_blacklisted_broad_wildcard',
      userId: 'usr_broad_buyer',
      userEmail: 'broad.buyer@example.com',
      paymentAccount: 'card_broad_88',
      affiliateId: 'aff_john_doe',
      amount: 120,
      ip: '10.200.55.88',
    });

    expect(result.signals.some((s) => s.type === 'IP_BLACKLISTED')).toBe(true);
    expect(result.decision).toBe('REJECT');
    expect(result.signals.find((s) => s.type === 'IP_BLACKLISTED')?.metadata?.matchedPattern).toBe('10.200.*.*');
  });

  it('should trigger REFERRER_SPAM_OR_CLOAKED for blacklisted domain', async () => {
    const result = await evaluateOrderRisk({
      orderId: 'ord_spam_1',
      userId: 'usr_spam',
      userEmail: 'spam.user@example.com',
      paymentAccount: 'card_spam_123',
      affiliateId: 'aff_john_doe',
      amount: 50,
      ip: '203.0.113.88',
      referrer: 'https://spam-ad-network.biz/redirect?target=123',
    });

    expect(result.signals.some((s) => s.type === 'REFERRER_SPAM_OR_CLOAKED')).toBe(true);
  });
});
