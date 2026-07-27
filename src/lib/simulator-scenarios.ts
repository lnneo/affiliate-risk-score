export type SimulatorDecision = 'APPROVE' | 'PENDING_REVIEW' | 'MANUAL_REVIEW' | 'REJECT';

export type SimulatorFormData = {
  affiliateId: string;
  userEmail: string;
  userId: string;
  paymentAccount: string;
  ip: string;
  cookieId: string;
  fingerprintHash: string;
  country: string;
  referrer: string;
  externalCustomerId: string;
  isVpn: boolean;
  isDatacenter: boolean;
  amount: number;
};

export type SimulatorScenario = {
  id:
    | 'approve_clean'
    | 'pending_same_ip_vpn'
    | 'pending_disposable_vpn'
    | 'pending_referrer_spam'
    | 'pending_geo_vpn'
    | 'pending_ip_disposable'
    | 'manual_same_fingerprint'
    | 'manual_ip_datacenter_vpn'
    | 'manual_geo_referrer_vpn'
    | 'reject_self_referral'
    | 'reject_blacklisted_ip'
    | 'reject_duplicate_conversion'
    | 'reject_same_cookie';
  decision: SimulatorDecision;
  primaryRule: string;
  ruleTypes: string[];
  form: SimulatorFormData;
};

export const DECISION_STATES: Array<{
  key: SimulatorDecision;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
}> = [
  { key: 'APPROVE', color: 'emerald' },
  { key: 'PENDING_REVIEW', color: 'blue' },
  { key: 'MANUAL_REVIEW', color: 'amber' },
  { key: 'REJECT', color: 'rose' },
];

const BUYER_IP = '24.180.12.99';
const AFFILIATE_IP = '118.69.182.10';

const SCENARIO_IPS: Record<string, string> = {
  approve_clean: '10.20.0.1',
  pending_same_ip_vpn: AFFILIATE_IP,
  pending_disposable_vpn: '10.20.1.1',
  pending_referrer_spam: '10.20.1.2',
  pending_geo_vpn: '10.20.1.3',
  pending_ip_disposable: AFFILIATE_IP,
  manual_same_fingerprint: '10.20.2.1',
  manual_ip_datacenter_vpn: AFFILIATE_IP,
  manual_geo_referrer_vpn: '10.20.2.3',
  reject_self_referral: '10.20.3.1',
  reject_blacklisted_ip: '198.51.100.99',
  reject_duplicate_conversion: '10.20.3.3',
  reject_same_cookie: '10.20.3.4',
};

function createScenarioForm(
  id: string,
  overrides: Partial<SimulatorFormData> = {},
): SimulatorFormData {
  return {
    affiliateId: 'aff_john_doe',
    userId: `usr_sim_${id}`,
    userEmail: `buyer.${id}@gmail.com`,
    paymentAccount: `card_sim_${id}`,
    ip: SCENARIO_IPS[id] ?? BUYER_IP,
    cookieId: `ck_sim_${id}`,
    fingerprintHash: `fp_sim_${id}`,
    country: 'US',
    referrer: 'https://techblog.com/review',
    externalCustomerId: `cust_sim_${id}`,
    isVpn: false,
    isDatacenter: false,
    amount: 149,
    ...overrides,
  };
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'approve_clean',
    decision: 'APPROVE',
    primaryRule: 'CLEAN',
    ruleTypes: ['CLEAN'],
    form: createScenarioForm('approve_clean'),
  },
  {
    id: 'pending_same_ip_vpn',
    decision: 'PENDING_REVIEW',
    primaryRule: 'SAME_IP',
    ruleTypes: ['SAME_IP', 'VPN_USAGE'],
    form: createScenarioForm('pending_same_ip_vpn', { isVpn: true }),
  },
  {
    id: 'pending_disposable_vpn',
    decision: 'PENDING_REVIEW',
    primaryRule: 'DISPOSABLE_EMAIL',
    ruleTypes: ['DISPOSABLE_EMAIL', 'VPN_USAGE'],
    form: createScenarioForm('pending_disposable_vpn', {
      userEmail: 'buyer.temp@mailinator.com',
      isVpn: true,
    }),
  },
  {
    id: 'pending_referrer_spam',
    decision: 'PENDING_REVIEW',
    primaryRule: 'REFERRER_SPAM_OR_CLOAKED',
    ruleTypes: ['REFERRER_SPAM_OR_CLOAKED', 'VPN_USAGE'],
    form: createScenarioForm('pending_referrer_spam', {
      referrer: 'https://spam-ad-network.biz/redirect',
      isVpn: true,
    }),
  },
  {
    id: 'pending_geo_vpn',
    decision: 'PENDING_REVIEW',
    primaryRule: 'SUSPICIOUS_GEOLOCATION',
    ruleTypes: ['SUSPICIOUS_GEOLOCATION', 'VPN_USAGE'],
    form: createScenarioForm('pending_geo_vpn', {
      country: 'RU',
      isVpn: true,
    }),
  },
  {
    id: 'pending_ip_disposable',
    decision: 'PENDING_REVIEW',
    primaryRule: 'SAME_IP',
    ruleTypes: ['SAME_IP', 'DISPOSABLE_EMAIL'],
    form: createScenarioForm('pending_ip_disposable', {
      userEmail: 'risk.buyer@guerrillamail.com',
    }),
  },
  {
    id: 'manual_same_fingerprint',
    decision: 'MANUAL_REVIEW',
    primaryRule: 'SAME_FINGERPRINT',
    ruleTypes: ['SAME_FINGERPRINT'],
    form: createScenarioForm('manual_same_fingerprint', {
      fingerprintHash: 'fp_john_macbook_m2',
    }),
  },
  {
    id: 'manual_ip_datacenter_vpn',
    decision: 'MANUAL_REVIEW',
    primaryRule: 'SAME_IP',
    ruleTypes: ['SAME_IP', 'DATACENTER_IP', 'VPN_USAGE'],
    form: createScenarioForm('manual_ip_datacenter_vpn', {
      isDatacenter: true,
      isVpn: true,
    }),
  },
  {
    id: 'manual_geo_referrer_vpn',
    decision: 'MANUAL_REVIEW',
    primaryRule: 'SUSPICIOUS_GEOLOCATION',
    ruleTypes: ['SUSPICIOUS_GEOLOCATION', 'REFERRER_SPAM_OR_CLOAKED', 'VPN_USAGE'],
    form: createScenarioForm('manual_geo_referrer_vpn', {
      country: 'IR',
      referrer: 'https://spam-ad-network.biz/redirect',
      isVpn: true,
    }),
  },
  {
    id: 'reject_self_referral',
    decision: 'REJECT',
    primaryRule: 'SELF_REFERRAL',
    ruleTypes: ['SELF_REFERRAL', 'SAME_PAYMENT_ACCOUNT'],
    form: createScenarioForm('reject_self_referral', {
      userId: 'aff_john_doe',
      userEmail: 'john_doe@affiliate.com',
      paymentAccount: 'paypal_john_doe@affiliate.com',
      amount: 299,
    }),
  },
  {
    id: 'reject_blacklisted_ip',
    decision: 'REJECT',
    primaryRule: 'IP_BLACKLISTED',
    ruleTypes: ['IP_BLACKLISTED'],
    form: createScenarioForm('reject_blacklisted_ip', { amount: 99 }),
  },
  {
    id: 'reject_duplicate_conversion',
    decision: 'REJECT',
    primaryRule: 'DUPLICATE_CONVERSION',
    ruleTypes: ['DUPLICATE_CONVERSION'],
    form: createScenarioForm('reject_duplicate_conversion', {
      externalCustomerId: 'cust_alice_101',
      amount: 199,
    }),
  },
  {
    id: 'reject_same_cookie',
    decision: 'REJECT',
    primaryRule: 'SAME_COOKIE',
    ruleTypes: ['SAME_COOKIE'],
    form: createScenarioForm('reject_same_cookie', {
      cookieId: 'ck_aff_john_doe_master',
    }),
  },
];

export function getScenariosByDecision(decision: SimulatorDecision): SimulatorScenario[] {
  return SIMULATOR_SCENARIOS.filter((scenario) => scenario.decision === decision);
}

export function getRuleFiltersForDecision(decision: SimulatorDecision): string[] {
  const rules = new Set<string>();
  for (const scenario of getScenariosByDecision(decision)) {
    for (const rule of scenario.ruleTypes) {
      if (rule !== 'CLEAN') {
        rules.add(rule);
      }
    }
  }
  return Array.from(rules).sort();
}

export function findScenarioById(id: string): SimulatorScenario | undefined {
  return SIMULATOR_SCENARIOS.find((scenario) => scenario.id === id);
}

export function toOrderContext(form: SimulatorFormData, options?: { orderId?: string; cookieId?: string }) {
  return {
    orderId: options?.orderId ?? `ord_sim_${form.userId}`,
    userId: form.userId,
    userEmail: form.userEmail,
    paymentAccount: form.paymentAccount,
    affiliateId: form.affiliateId,
    amount: form.amount,
    cookieId: options?.cookieId ?? form.cookieId,
    fingerprintHash: form.fingerprintHash,
    ip: form.ip,
    country: form.country,
    referrer: form.referrer,
    externalCustomerId: form.externalCustomerId,
    isVpn: form.isVpn,
    isDatacenter: form.isDatacenter,
  };
}
