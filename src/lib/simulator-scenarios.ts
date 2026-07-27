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
  id: string;
  decision: SimulatorDecision;
  name: string;
  primaryRule: string;
  ruleTypes: string[];
  expectedScore: string;
  description: string;
  form: SimulatorFormData;
};

export const DECISION_STATES: Array<{
  key: SimulatorDecision;
  label: string;
  scoreRange: string;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
}> = [
  { key: 'APPROVE', label: 'Đã duyệt', scoreRange: '< 40 điểm', color: 'emerald' },
  { key: 'PENDING_REVIEW', label: 'Tạm giữ', scoreRange: '40 – 69 điểm', color: 'blue' },
  { key: 'MANUAL_REVIEW', label: 'Cần kiểm tra', scoreRange: '70 – 99 điểm', color: 'amber' },
  { key: 'REJECT', label: 'Từ chối', scoreRange: '≥ 100 điểm', color: 'rose' },
];

const cleanBuyerBase: SimulatorFormData = {
  affiliateId: 'aff_john_doe',
  userId: 'usr_clean_alice',
  userEmail: 'alice.smith@gmail.com',
  paymentAccount: 'card_visa_9841',
  ip: '24.180.12.99',
  cookieId: 'ck_alice_session_1',
  fingerprintHash: 'fp_alice_macbook_m1',
  country: 'US',
  referrer: 'https://techblog.com/review',
  externalCustomerId: 'cust_alice_881',
  isVpn: false,
  isDatacenter: false,
  amount: 149,
};

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'approve_clean',
    decision: 'APPROVE',
    name: 'Giao dịch sạch',
    primaryRule: 'Không kích hoạt rule',
    ruleTypes: ['CLEAN'],
    expectedScore: '0 điểm',
    description: 'Người mua dùng email, PayPal, IP và thiết bị hoàn toàn độc lập với affiliate.',
    form: { ...cleanBuyerBase },
  },
  {
    id: 'pending_same_ip_vpn',
    decision: 'PENDING_REVIEW',
    name: 'Trùng IP + VPN',
    primaryRule: 'SAME_IP',
    ruleTypes: ['SAME_IP', 'VPN_USAGE'],
    expectedScore: '55 điểm',
    description: 'IP người mua trùng IP đăng ký của affiliate và có dấu hiệu VPN thương mại.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_pending_ip_vpn',
      ip: '118.69.182.10',
      isVpn: true,
      externalCustomerId: 'cust_pending_ip_vpn',
    },
  },
  {
    id: 'pending_disposable_vpn',
    decision: 'PENDING_REVIEW',
    name: 'Email rác + VPN',
    primaryRule: 'DISPOSABLE_EMAIL',
    ruleTypes: ['DISPOSABLE_EMAIL', 'VPN_USAGE'],
    expectedScore: '50 điểm',
    description: 'Người mua dùng email tạm thời kết hợp IP VPN.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_pending_disposable',
      userEmail: 'buyer.temp@mailinator.com',
      isVpn: true,
      externalCustomerId: 'cust_pending_disposable',
    },
  },
  {
    id: 'pending_referrer_spam',
    decision: 'PENDING_REVIEW',
    name: 'Referrer spam + VPN',
    primaryRule: 'REFERRER_SPAM_OR_CLOAKED',
    ruleTypes: ['REFERRER_SPAM_OR_CLOAKED', 'VPN_USAGE'],
    expectedScore: '50 điểm',
    description: 'Traffic đến từ domain referrer nằm trong blacklist spam.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_pending_referrer',
      referrer: 'https://spam-ad-network.biz/redirect',
      isVpn: true,
      externalCustomerId: 'cust_pending_referrer',
    },
  },
  {
    id: 'pending_geo_vpn',
    decision: 'PENDING_REVIEW',
    name: 'Geo rủi ro + VPN',
    primaryRule: 'SUSPICIOUS_GEOLOCATION',
    ruleTypes: ['SUSPICIOUS_GEOLOCATION', 'VPN_USAGE'],
    expectedScore: '50 điểm',
    description: 'Quốc gia nằm ngoài thị trường mục tiêu và có dấu hiệu VPN.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_pending_geo',
      country: 'RU',
      isVpn: true,
      externalCustomerId: 'cust_pending_geo',
    },
  },
  {
    id: 'pending_ip_disposable',
    decision: 'PENDING_REVIEW',
    name: 'Trùng IP + Email rác',
    primaryRule: 'SAME_IP',
    ruleTypes: ['SAME_IP', 'DISPOSABLE_EMAIL'],
    expectedScore: '65 điểm',
    description: 'Cùng IP với affiliate và dùng email disposable.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_pending_ip_disposable',
      userEmail: 'risk.buyer@guerrillamail.com',
      ip: '118.69.182.10',
      externalCustomerId: 'cust_pending_ip_disposable',
    },
  },
  {
    id: 'manual_same_fingerprint',
    decision: 'MANUAL_REVIEW',
    name: 'Trùng vân tay thiết bị',
    primaryRule: 'SAME_FINGERPRINT',
    ruleTypes: ['SAME_FINGERPRINT'],
    expectedScore: '70 điểm',
    description: 'Fingerprint người mua trùng thiết bị đã đăng ký của affiliate.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_manual_fingerprint',
      fingerprintHash: 'fp_john_macbook_m2',
      externalCustomerId: 'cust_manual_fingerprint',
    },
  },
  {
    id: 'manual_ip_datacenter_vpn',
    decision: 'MANUAL_REVIEW',
    name: 'Trùng IP + Datacenter + VPN',
    primaryRule: 'SAME_IP',
    ruleTypes: ['SAME_IP', 'DATACENTER_IP', 'VPN_USAGE'],
    expectedScore: '75 điểm',
    description: 'IP trùng affiliate, nguồn datacenter cloud và có VPN.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_manual_network',
      ip: '118.69.182.10',
      isDatacenter: true,
      isVpn: true,
      externalCustomerId: 'cust_manual_network',
    },
  },
  {
    id: 'manual_geo_referrer_vpn',
    decision: 'MANUAL_REVIEW',
    name: 'Geo + Referrer spam + VPN',
    primaryRule: 'SUSPICIOUS_GEOLOCATION',
    ruleTypes: ['SUSPICIOUS_GEOLOCATION', 'REFERRER_SPAM_OR_CLOAKED', 'VPN_USAGE'],
    expectedScore: '80 điểm',
    description: 'Kết hợp geo rủi ro, referrer blacklist và VPN.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_manual_combo',
      country: 'IR',
      referrer: 'https://spam-ad-network.biz/redirect',
      isVpn: true,
      externalCustomerId: 'cust_manual_combo',
    },
  },
  {
    id: 'reject_self_referral',
    decision: 'REJECT',
    name: 'Tự giới thiệu',
    primaryRule: 'SELF_REFERRAL',
    ruleTypes: ['SELF_REFERRAL', 'SAME_PAYMENT_ACCOUNT'],
    expectedScore: '≥ 100 điểm',
    description: 'Affiliate dùng chính email và tài khoản thanh toán để mua qua link giới thiệu.',
    form: {
      ...cleanBuyerBase,
      userId: 'aff_john_doe',
      userEmail: 'john_doe@affiliate.com',
      paymentAccount: 'paypal_john_doe@affiliate.com',
      ip: '118.69.182.10',
      cookieId: 'ck_john_master_session',
      fingerprintHash: 'fp_john_macbook_m2',
      externalCustomerId: 'cust_john_self',
      amount: 299,
    },
  },
  {
    id: 'reject_blacklisted_ip',
    decision: 'REJECT',
    name: 'IP blacklist',
    primaryRule: 'IP_BLACKLISTED',
    ruleTypes: ['IP_BLACKLISTED'],
    expectedScore: '100 điểm',
    description: 'IP nằm trong danh sách đen bảo mật (click farm).',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_bad_actor',
      userEmail: 'bad.actor@example.com',
      paymentAccount: 'card_bad_9910',
      ip: '198.51.100.99',
      cookieId: 'ck_bad_session_99',
      fingerprintHash: 'fp_bad_actor_device',
      referrer: 'https://spam-ad-network.biz/redirect',
      externalCustomerId: 'cust_bad_actor',
      amount: 99,
    },
  },
  {
    id: 'reject_duplicate_conversion',
    decision: 'REJECT',
    name: 'Trùng mã khách hàng',
    primaryRule: 'DUPLICATE_CONVERSION',
    ruleTypes: ['DUPLICATE_CONVERSION'],
    expectedScore: '100 điểm',
    description: 'Mã khách hàng đã được ghi nhận hoa hồng trước đó. Khuyến nghị bấm "Nạp dữ liệu" trước khi chạy.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_repeat_claim',
      userEmail: 'repeat.claim@gmail.com',
      paymentAccount: 'card_visa_0012',
      ip: '203.0.113.44',
      cookieId: 'ck_repeat_session',
      fingerprintHash: 'fp_repeat_device',
      referrer: 'https://google.com',
      externalCustomerId: 'cust_alice_101',
      amount: 199,
    },
  },
  {
    id: 'reject_same_cookie',
    decision: 'REJECT',
    name: 'Trùng cookie affiliate',
    primaryRule: 'SAME_COOKIE',
    ruleTypes: ['SAME_COOKIE'],
    expectedScore: '100 điểm',
    description: 'Cookie phiên mua hàng liên quan trực tiếp tới session quản trị của affiliate.',
    form: {
      ...cleanBuyerBase,
      userId: 'usr_same_cookie',
      cookieId: 'ck_aff_john_doe_master',
      externalCustomerId: 'cust_same_cookie',
    },
  },
];

export function getScenariosByDecision(decision: SimulatorDecision): SimulatorScenario[] {
  return SIMULATOR_SCENARIOS.filter((scenario) => scenario.decision === decision);
}

export function getRuleFiltersForDecision(decision: SimulatorDecision): string[] {
  const rules = new Set<string>();
  for (const scenario of getScenariosByDecision(decision)) {
    for (const rule of scenario.ruleTypes) {
      rules.add(rule);
    }
  }
  return Array.from(rules).sort();
}

export function findScenarioById(id: string): SimulatorScenario | undefined {
  return SIMULATOR_SCENARIOS.find((scenario) => scenario.id === id);
}
