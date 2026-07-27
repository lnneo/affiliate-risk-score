export type RiskDecision = 'APPROVE' | 'PENDING_REVIEW' | 'MANUAL_REVIEW' | 'REJECT';

export interface FraudSignal {
  type: string;
  score: number;
  reason: string;
  metadata?: Record<string, any>;
}

export interface DeviceFingerprintData {
  fingerprintHash: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  timezone?: string;
  language?: string;
  screen?: string;
  canvasHash?: string;
  webglHash?: string;
  audioHash?: string;
  fontsHash?: string;
}

export interface OrderContext {
  orderId: string;
  userId: string;
  userEmail: string;
  paymentAccount: string;
  affiliateId: string;
  amount: number;
  cookieId?: string;
  fingerprintHash?: string;
  ip: string;
  country?: string;
  referrer?: string;
  externalCustomerId?: string;
  isVpn?: boolean;
  isDatacenter?: boolean;
  createdAt?: string;
}

export interface RuleConfig {
  type: string;
  weight: number;
  enabled: boolean;
  description: string;
}

export interface RiskEvaluationResult {
  riskScoreId: string;
  orderId: string;
  userId: string;
  affiliateId: string;
  totalScore: number;
  decision: RiskDecision;
  signals: FraudSignal[];
  thresholds: {
    approveMax: number;
    pendingMax: number;
    manualReviewMax: number;
  };
}
