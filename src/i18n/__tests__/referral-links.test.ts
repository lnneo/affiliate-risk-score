import { describe, expect, it } from 'vitest';

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function buildReferralLinks(origin: string, hostname: string, port: string, affiliateId: string) {
  const currentLink = `${origin}/ref/${affiliateId}`;
  if (isLocalHostname(hostname)) {
    const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ':3000';
    return {
      currentLink,
      shareLink: `http://192.168.20.24${portSuffix}/ref/${affiliateId}`,
    };
  }

  return {
    currentLink,
    shareLink: currentLink,
  };
}

describe('referral link mapping', () => {
  it('uses current origin for production domains without forcing :3000', () => {
    expect(
      buildReferralLinks('https://aff.lnd.life', 'aff.lnd.life', '', 'aff_john_doe'),
    ).toEqual({
      currentLink: 'https://aff.lnd.life/ref/aff_john_doe',
      shareLink: 'https://aff.lnd.life/ref/aff_john_doe',
    });
  });

  it('keeps LAN link only for localhost development', () => {
    expect(
      buildReferralLinks('http://localhost:3000', 'localhost', '3000', 'aff_john_doe'),
    ).toEqual({
      currentLink: 'http://localhost:3000/ref/aff_john_doe',
      shareLink: 'http://192.168.20.24:3000/ref/aff_john_doe',
    });
  });
});
