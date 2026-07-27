import type { Dictionary } from './vi';

export const en: Dictionary = {
  brand: {
    name: 'LinkPul',
    badge: 'Risk Engine v1.0',
    tagline: 'Affiliate Fraud Detection System',
  },
  nav: {
    simulator: 'Fraud Simulator',
    referral: 'Create Real Link',
    store: 'Checkout Store',
    dashboard: 'Admin Audit Log',
    config: 'Rule Config',
  },
  common: {
    copy: 'Copy',
    copied: 'Copied!',
    openLink: 'Open link',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    scanning: 'Scanning...',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    reset: 'Reset',
  },
  seed: {
    button: 'Seed data',
    loading: 'Seeding...',
    title: 'Load demo sample data',
    confirmTitle: 'Confirm seed data?',
    confirmBody:
      'This will clear current demo data (orders, clicks, risk scores) and reload sample scenarios. Do you want to continue?',
    confirmAction: 'Seed data',
    success: 'Demo data seeded!',
    error: 'Seed failed',
  },
  language: {
    label: 'Language',
    vi: 'Tiếng Việt',
    en: 'English',
  },
  referral: {
    eyebrow: 'Real Referral Link Center',
    title: 'Create & Share Referral Links (Real Device Testing)',
    description:
      'Use this page to get a real referral link. When you or a teammate opens it on a real device/phone, the browser will collect real FingerprintJS, IP, and session cookie data for the Risk Engine.',
    affiliateIdLabel: 'Affiliate ID:',
    fingerprintLabel: 'Your device fingerprint:',
    registerDevice: 'Register device',
    registering: 'Registering...',
    registered: 'Fingerprint saved as affiliate device!',
    currentDeviceTitle: '1. Link on current domain',
    currentDeviceBadge: 'Current',
    currentDeviceDesc:
      'Open this link in another browser on this device (or Incognito) to test fingerprint/IP matching against the affiliate.',
    shareTitle: '2. Shareable link',
    shareBadge: 'Share',
    shareDesc: 'Send this link via Slack/Zalo to teammates or open it on a phone.',
    lanTitle: '2. LAN link (same Wi-Fi)',
    lanBadge: 'LAN',
    lanDesc:
      'Only available on localhost. Share this link with teammates/phones on the same Wi-Fi network.',
    guideTitle: 'Recommended real-device test steps:',
    step1Title: 'Step 1: Register your fingerprint',
    step1Body:
      'Click “Register device” above so the system stores your real fingerprint as the affiliate master device.',
    step2Title: 'Step 2: Open another browser / share with teammate',
    step2Body:
      'Same device/browser cluster → fingerprint warning. Different teammate device → clean APPROVE.',
    step3Title: 'Step 3: Check Admin Audit Ledger',
    step3Body:
      'Open Admin Audit Log (/admin/dashboard) to review the transaction with real fingerprint and IP.',
  },
  simulator: {
    eyebrow: '100% Tapfiliate Enterprise Fraud Prevention Specs',
    title: 'Affiliate Fraud & Risk Score Engine',
    description:
      'A 15-rule multi-signal fraud engine covering device fingerprint, IP blacklist, referral cloaking, self-referral, duplicate conversion, velocity, and geolocation anomaly.',
    stateTitle: 'Simulate by decision state',
    stateHint: 'Pick a decision state, filter by rule, then choose a sample scenario.',
    ruleLabel: 'Rule:',
    allRules: 'All',
    orderTitle: 'Order & Buyer Information',
    evaluate: 'Evaluate',
    evaluating: 'Evaluating...',
    readyTitle: 'Ready to evaluate scenario (100% Tapfiliate Rules)',
    readyBody: 'Click “Evaluate” to run all 15 fraud prevention algorithms.',
    loadingTitle: 'Evaluating with Risk Engine...',
    loadingBody:
      'Recording the click, running Tapfiliate rules, and scoring this scenario.',
  },
  store: {
    eyebrow: 'Real Checkout Demo Store',
    title: 'Pro Plan Store ($99.00)',
    descriptionPrefix: 'This order is referred by Affiliate',
    checkoutTitle: 'Real Checkout Details',
    pay: 'Checkout',
    paying: 'Processing...',
    readyTitle: 'Ready to checkout & evaluate',
    readyBody:
      'Click “Checkout” to simulate a real purchase. The Risk Engine result will appear here.',
    loadingTitle: 'Processing payment...',
    loadingBody: 'Risk Engine is evaluating the transaction and saving it to the Admin Audit Ledger.',
  },
  dashboard: {
    title: 'Affiliate Risk Score Audit Ledger',
    description:
      'Review scored transactions, inspect fraud signals, and manually override commission decisions.',
    loadingOverlay: 'Loading audit log...',
  },
  config: {
    title: '15 Rules & Blacklist Manager',
    description:
      'Adjust Tapfiliate Enterprise rule weights and manage high-risk IP/domain blacklist entries.',
    loadingOverlay: 'Loading blacklist...',
  },
};
