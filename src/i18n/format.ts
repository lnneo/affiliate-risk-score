export function replaceCount(template: string, count: number | string): string {
  return template.replace('{count}', String(count)).replace('{n}', String(count));
}

export function formatReason(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

type ReasonParams = Record<string, string | number>;

export type FraudReasonInput = {
  reason: string;
  reasonKey?: string;
  reasonParams?: ReasonParams;
  /** Live evaluation uses `type`; persisted admin rows use `signal_type`. */
  type?: string;
  signal_type?: string;
  metadata?: Record<string, unknown> | null;
};

const SIGNAL_TYPE_TO_REASON_KEY: Record<string, string> = {
  SELF_REFERRAL: 'selfReferral',
  SAME_PAYMENT_ACCOUNT: 'samePaymentAccount',
  SAME_COOKIE: 'sameCookie',
  SAME_FINGERPRINT: 'sameFingerprint',
  DISPOSABLE_EMAIL: 'disposableEmail',
  SAME_IP: 'sameIp',
  VPN_USAGE: 'vpnUsage',
  DATACENTER_IP: 'datacenterIp',
  VELOCITY_EXCEEDED: 'velocityExceeded',
  IP_BLACKLISTED: 'ipBlacklisted',
  REFERRER_SPAM_OR_CLOAKED: 'referrerCloaking',
  SUSPICIOUS_GEOLOCATION: 'suspiciousGeolocation',
  CLICK_INFLATION_NO_CONVERSION: 'clickInflationNoConversion',
  DUPLICATE_CONVERSION: 'duplicateConversion',
};

function previewHash(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  return value.length > 15 ? `${value.slice(0, 15)}...` : value;
}

function asParams(value: unknown): ReasonParams | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => typeof v === 'string' || typeof v === 'number',
  );
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries) as ReasonParams;
}

function inferReasonKey(signalType: string | undefined, meta: Record<string, unknown>): string | undefined {
  if (!signalType) return undefined;

  if (signalType === 'SAME_FINGERPRINT') {
    if (meta.hardwareCluster || meta.reasonKey === 'hardwareClusterFingerprint') {
      return 'hardwareClusterFingerprint';
    }
    return 'sameFingerprint';
  }

  if (signalType === 'REFERRER_SPAM_OR_CLOAKED') {
    if (meta.blacklistedDomain || meta.reasonKey === 'referrerSpamBlacklisted') {
      return 'referrerSpamBlacklisted';
    }
    return 'referrerCloaking';
  }

  return SIGNAL_TYPE_TO_REASON_KEY[signalType];
}

function inferReasonParams(reasonKey: string | undefined, meta: Record<string, unknown>): ReasonParams | undefined {
  if (!reasonKey) return undefined;

  switch (reasonKey) {
    case 'selfReferral':
      return {
        buyerEmail: String(meta.buyerEmail ?? ''),
        affiliateEmail: String(meta.affiliateEmail ?? ''),
      };
    case 'samePaymentAccount':
      return {
        paymentAccount: String(meta.paymentAccount ?? ''),
        affiliatePayment: String(meta.affiliatePayment ?? ''),
      };
    case 'sameCookie':
      return { cookiePreview: previewHash(meta.cookieId) || String(meta.cookiePreview ?? '') };
    case 'sameFingerprint':
      return {
        fingerprintPreview: previewHash(meta.fingerprintHash) || String(meta.fingerprintPreview ?? ''),
        affiliateFpPreview:
          previewHash(meta.registeredAffiliateFingerprint) || String(meta.affiliateFpPreview ?? ''),
      };
    case 'hardwareClusterFingerprint': {
      const cluster = typeof meta.hardwareCluster === 'string' ? meta.hardwareCluster.split(' / ') : [];
      return {
        os: String(meta.os ?? cluster[0] ?? ''),
        screen: String(meta.screen ?? cluster[1] ?? ''),
      };
    }
    case 'disposableEmail':
      return { domain: String(meta.domain ?? '') };
    case 'sameIp':
      return {
        ip: String(meta.ip ?? ''),
        affiliateIp: String(meta.affiliateIp ?? 'referral IP'),
      };
    case 'vpnUsage':
    case 'datacenterIp':
      return { ip: String(meta.ip ?? '') };
    case 'velocityExceeded':
      return {
        ordersLast10Min: Number(meta.ordersLast10Min ?? 0),
        ip: String(meta.ip ?? ''),
        clicksLast5Min: Number(meta.clicksLast5Min ?? 0),
      };
    case 'ipBlacklisted':
      return {
        ip: String(meta.ip ?? ''),
        matchedPattern: String(meta.matchedPattern ?? ''),
        blacklistReason: String(meta.reason ?? meta.blacklistReason ?? 'High-risk IP'),
      };
    case 'referrerSpamBlacklisted':
      return {
        referrer: String(meta.referrer ?? ''),
        blacklistReason: String(meta.blacklistReason ?? meta.reason ?? ''),
      };
    case 'suspiciousGeolocation':
      return { country: String(meta.country ?? '') };
    case 'clickInflationNoConversion':
      return { clicks24h: Number(meta.clicks24h ?? 0) };
    case 'duplicateConversion':
      return { externalCustomerId: String(meta.externalCustomerId ?? '') };
    default:
      return undefined;
  }
}

/** Build metadata payload persisted with each fraud signal for locale-aware UI replay. */
export function fraudSignalPersistMetadata(signal: {
  reasonKey?: string;
  reasonParams?: ReasonParams;
  metadata?: Record<string, unknown>;
}): Record<string, unknown> | null {
  const base = signal.metadata ? { ...signal.metadata } : {};
  if (signal.reasonKey) base.reasonKey = signal.reasonKey;
  if (signal.reasonParams) base.reasonParams = signal.reasonParams;
  return Object.keys(base).length > 0 ? base : null;
}

export function resolveFraudSignalReason(
  signal: FraudReasonInput,
  fraudReasons: Record<string, string>,
): string {
  const meta = (signal.metadata ?? {}) as Record<string, unknown>;
  const reasonKey =
    signal.reasonKey ||
    (typeof meta.reasonKey === 'string' ? meta.reasonKey : undefined) ||
    inferReasonKey(signal.signal_type ?? signal.type, meta);

  const reasonParams =
    signal.reasonParams ||
    asParams(meta.reasonParams) ||
    inferReasonParams(reasonKey, meta);

  if (reasonKey && fraudReasons[reasonKey]) {
    return formatReason(fraudReasons[reasonKey], reasonParams);
  }

  return signal.reason;
}
