import { describe, expect, it } from 'vitest';
import {
  fraudSignalPersistMetadata,
  resolveFraudSignalReason,
} from '../format';
import { en } from '../dictionaries/en';
import { vi } from '../dictionaries/vi';

describe('resolveFraudSignalReason', () => {
  it('translates live signals via reasonKey', () => {
    const text = resolveFraudSignalReason(
      {
        reason: 'fallback',
        reasonKey: 'vpnUsage',
        reasonParams: { ip: '1.2.3.4' },
      },
      en.fraudReasons,
    );
    expect(text).toContain('1.2.3.4');
    expect(text).toContain('commercial VPN');
  });

  it('translates persisted dashboard signals from metadata reasonKey', () => {
    const text = resolveFraudSignalReason(
      {
        reason: 'Địa chỉ IP (9.9.9.9) bị phát hiện là dịch vụ VPN thương mại',
        signal_type: 'VPN_USAGE',
        metadata: {
          reasonKey: 'vpnUsage',
          reasonParams: { ip: '9.9.9.9' },
          ip: '9.9.9.9',
        },
      },
      en.fraudReasons,
    );
    expect(text).toBe(en.fraudReasons.vpnUsage.replace('{ip}', '9.9.9.9'));
  });

  it('infers reasonKey from signal_type for legacy rows without reasonKey', () => {
    const textVi = resolveFraudSignalReason(
      {
        reason: 'legacy vietnamese text',
        signal_type: 'SELF_REFERRAL',
        metadata: {
          buyerEmail: 'a@x.com',
          affiliateEmail: 'b@y.com',
        },
      },
      vi.fraudReasons,
    );
    expect(textVi).toContain('a@x.com');
    expect(textVi).toContain('b@y.com');
    expect(textVi).toContain('trùng');
  });

  it('distinguishes hardware cluster fingerprint from exact match', () => {
    const text = resolveFraudSignalReason(
      {
        reason: 'legacy',
        signal_type: 'SAME_FINGERPRINT',
        metadata: { hardwareCluster: 'macOS / 1920x1080' },
      },
      en.fraudReasons,
    );
    expect(text).toContain('hardware cluster');
    expect(text).toContain('macOS');
    expect(text).toContain('1920x1080');
  });
});

describe('fraudSignalPersistMetadata', () => {
  it('embeds reasonKey and reasonParams into metadata', () => {
    expect(
      fraudSignalPersistMetadata({
        reasonKey: 'sameIp',
        reasonParams: { ip: '1.1.1.1', affiliateIp: '2.2.2.2' },
        metadata: { ip: '1.1.1.1' },
      }),
    ).toEqual({
      ip: '1.1.1.1',
      reasonKey: 'sameIp',
      reasonParams: { ip: '1.1.1.1', affiliateIp: '2.2.2.2' },
    });
  });
});
