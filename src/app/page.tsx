'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  ShoppingCart, 
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  Globe,
  Mail,
  CreditCard,
  Key,
  Flame,
  UserCheck,
  ArrowRightLeft,
  AlertCircle,
  Link as LinkIcon,
  CopyCheck
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  badge: string;
  color: string;
  description: string;
  form: {
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
}

const AFFILIATE_PROMOTER = {
  id: 'aff_john_doe',
  name: 'John Doe (Affiliate Promoter)',
  email: 'john_doe@affiliate.com',
  paymentAccount: 'paypal_john_doe@affiliate.com',
  registeredIp: '118.69.182.10',
  deviceFingerprint: 'fp_john_macbook_m2',
};

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'clean',
    name: 'Người dùng Hợp lệ',
    badge: 'Dự kiến Duyệt (0 điểm)',
    color: 'emerald',
    description: 'Khách hàng Alice mua hàng từ thiết bị riêng, IP dân dụng, email & phương thức thanh toán hoàn toàn độc lập.',
    form: {
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
      amount: 149.00,
    },
  },
  {
    id: 'self_referral',
    name: 'Tự giới thiệu (Self Referral)',
    badge: 'Từ chối (+100 điểm)',
    color: 'rose',
    description: 'Affiliate John Doe tự dùng chính email và tài khoản PayPal của mình để mua hàng qua link giới thiệu.',
    form: {
      affiliateId: 'aff_john_doe',
      userId: 'aff_john_doe',
      userEmail: 'john_doe@affiliate.com',
      paymentAccount: 'paypal_john_doe@affiliate.com',
      ip: '118.69.182.10',
      cookieId: 'ck_john_master_session',
      fingerprintHash: 'fp_john_macbook_m2',
      country: 'US',
      referrer: 'https://techblog.com/review',
      externalCustomerId: 'cust_john_self',
      isVpn: false,
      isDatacenter: false,
      amount: 299.00,
    },
  },
  {
    id: 'blacklisted_ip',
    name: 'IP Trong Danh Sách Đen',
    badge: 'Từ chối (+100 điểm)',
    color: 'rose',
    description: 'Địa chỉ IP 198.51.100.99 nằm trong danh sách đen bảo mật (Security Blacklist) chuyên tạo click farm ảo.',
    form: {
      affiliateId: 'aff_john_doe',
      userId: 'usr_bad_actor',
      userEmail: 'bad.actor@example.com',
      paymentAccount: 'card_bad_9910',
      ip: '198.51.100.99',
      cookieId: 'ck_bad_session_99',
      fingerprintHash: 'fp_bad_actor_device',
      country: 'US',
      referrer: 'https://spam-ad-network.biz/redirect',
      externalCustomerId: 'cust_bad_actor',
      isVpn: false,
      isDatacenter: false,
      amount: 99.00,
    },
  },
  {
    id: 'duplicate_conversion',
    name: 'Trùng Mã Khách Hàng',
    badge: 'Từ chối (+100 điểm)',
    color: 'purple',
    description: 'Mã khách hàng cust_external_9999 đã được nhận hoa hồng trước đó, cố tình tạo đơn để nhận lại hoa hồng.',
    form: {
      affiliateId: 'aff_john_doe',
      userId: 'usr_repeat_claim',
      userEmail: 'repeat.claim@gmail.com',
      paymentAccount: 'card_visa_0012',
      ip: '203.0.113.44',
      cookieId: 'ck_repeat_session',
      fingerprintHash: 'fp_repeat_device',
      country: 'US',
      referrer: 'https://google.com',
      externalCustomerId: 'cust_external_9999',
      isVpn: false,
      isDatacenter: false,
      amount: 199.00,
    },
  },
];

export default function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('clean');
  const [formData, setFormData] = useState(PRESET_SCENARIOS[0].form);

  const [clickResult, setClickResult] = useState<any>(null);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScenarioChange = (scen: Scenario) => {
    setSelectedScenario(scen.id);
    setFormData(scen.form);
    setClickResult(null);
    setEvaluationResult(null);
  };

  const runSimulation = async () => {
    setLoading(true);
    setClickResult(null);
    setEvaluationResult(null);

    try {
      const clickRes = await fetch('/api/tracking/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId: formData.affiliateId,
          cookieId: formData.cookieId,
          fingerprintHash: formData.fingerprintHash,
          ip: formData.ip,
          country: formData.country,
          referrer: formData.referrer,
          isVpn: formData.isVpn,
          isDatacenter: formData.isDatacenter,
        }),
      });
      const clickData = await clickRes.json();
      setClickResult(clickData);

      const checkoutRes = await fetch('/api/checkout/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const evalData = await checkoutRes.json();
      setEvaluationResult(evalData.evaluation);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEmailMatched = formData.userEmail.toLowerCase() === AFFILIATE_PROMOTER.email.toLowerCase() || formData.userEmail.includes(formData.affiliateId);
  const isPaymentMatched = formData.paymentAccount.toLowerCase() === AFFILIATE_PROMOTER.paymentAccount.toLowerCase();
  const isFingerprintMatched = formData.fingerprintHash === AFFILIATE_PROMOTER.deviceFingerprint;
  const isIpMatched = formData.ip === AFFILIATE_PROMOTER.registeredIp;

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'APPROVE':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-base glow-emerald max-w-full">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="break-words">DUYỆT HOA HỒNG (APPROVE - Giao dịch sạch)</span>
          </div>
        );
      case 'PENDING_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-base max-w-full">
            <Clock className="h-5 w-5 shrink-0" />
            <span className="break-words">TẠM GIỮ CHỜ DUYỆT (PENDING REVIEW)</span>
          </div>
        );
      case 'MANUAL_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-base glow-amber max-w-full">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="break-words">CẦN KIỂM TRA THỦ CÔNG (MANUAL REVIEW)</span>
          </div>
        );
      case 'REJECT':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-base glow-rose max-w-full">
            <XCircle className="h-5 w-5 shrink-0" />
            <span className="break-words">TỪ CHỐI HOA HỒNG (REJECT - Gian lận)</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8 min-w-0">
        {/* Header Hero Section */}
        <div className="space-y-3 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            100% Tapfiliate Enterprise Fraud Prevention Specs
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl break-words">
            Affiliate Fraud & Risk Score Engine
          </h1>
          <p className="text-slate-400 max-w-3xl text-sm leading-relaxed break-words">
            Hệ thống 15 thuật toán phát hiện gian lận đa tín hiệu: Vân tay thiết bị, IP Blacklist, Referral Cloaking, Tự giới thiệu, Trùng mã chuyển đổi, Velocity & Geolocation Anomaly.
          </p>
        </div>

        {/* Preset Scenario Tabs */}
        <div className="space-y-3 min-w-0">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Chọn Kịch bản Giả lập Mẫu (15 Tapfiliate Rules):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_SCENARIOS.map((scen) => {
              const isSelected = selectedScenario === scen.id;
              return (
                <button
                  key={scen.id}
                  onClick={() => handleScenarioChange(scen)}
                  className={`text-left p-4 rounded-xl border transition-all glass-card-hover min-w-0 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-slate-100 truncate">{scen.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      scen.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      scen.color === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      scen.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {scen.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed break-words">{scen.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Affiliate Reference Profile Banner */}
        <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <UserCheck className="h-4 w-4 shrink-0" />
              Hồ sơ Người Giới thiệu Gốc (Affiliate Promoter Reference Profile)
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-semibold truncate">
              ID: {AFFILIATE_PROMOTER.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 min-w-0">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Email Affiliate:</span>
              <span className="font-bold text-slate-200 break-all">{AFFILIATE_PROMOTER.email}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 min-w-0">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Tài khoản Thanh toán:</span>
              <span className="font-bold text-slate-200 break-all">{AFFILIATE_PROMOTER.paymentAccount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 min-w-0">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Vân tay Thiết bị:</span>
              <span className="font-bold text-indigo-400 break-all">{AFFILIATE_PROMOTER.deviceFingerprint}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 min-w-0">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">IP Đăng ký:</span>
              <span className="font-bold text-slate-200 break-all">{AFFILIATE_PROMOTER.registeredIp}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          {/* Left Form */}
          <div className="lg:col-span-5 space-y-6 min-w-0">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="font-bold text-slate-200 text-base flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-indigo-400 shrink-0" />
                  Thông tin Đơn hàng & Người mua
                </h2>
                <button
                  onClick={() => setFormData(PRESET_SCENARIOS.find(s => s.id === selectedScenario)?.form || formData)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0 font-medium"
                >
                  <RefreshCw className="h-3 w-3" /> Đặt lại
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                    <Key className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> ID Người giới thiệu (Affiliate ID)
                  </label>
                  <input
                    type="text"
                    value={formData.affiliateId}
                    onChange={(e) => setFormData({ ...formData, affiliateId: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Email Người mua hàng
                    </label>
                    {isEmailMatched && (
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1 shrink-0">
                        <AlertCircle className="h-3 w-3" /> Trùng Email Affiliate!
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    className={`w-full bg-slate-950/80 border rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none break-all ${
                      isEmailMatched ? 'border-rose-500/80 text-rose-200' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5 truncate">
                      <CreditCard className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Tài khoản Thanh toán (PayPal / Thẻ)
                    </label>
                    {isPaymentMatched && (
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1 shrink-0">
                        <AlertCircle className="h-3 w-3" /> Trùng PayPal Affiliate!
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.paymentAccount}
                    onChange={(e) => setFormData({ ...formData, paymentAccount: e.target.value })}
                    className={`w-full bg-slate-950/80 border rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none break-all ${
                      isPaymentMatched ? 'border-rose-500/80 text-rose-200' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <label className="text-slate-400 font-medium flex items-center gap-1.5 truncate">
                        <Globe className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Địa chỉ IP
                      </label>
                      {isIpMatched && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1 rounded border border-amber-500/20 shrink-0">
                          Trùng IP
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.ip}
                      onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      className={`w-full bg-slate-950/80 border rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none break-all ${
                        isIpMatched ? 'border-amber-500/80 text-amber-200' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                      <Globe className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Quốc gia (ISO)
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                      <Laptop className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Vân tay Thiết bị
                    </label>
                    <input
                      type="text"
                      value={formData.fingerprintHash}
                      onChange={(e) => setFormData({ ...formData, fingerprintHash: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                      <CopyCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Mã Khách Hàng
                    </label>
                    <input
                      type="text"
                      value={formData.externalCustomerId}
                      onChange={(e) => setFormData({ ...formData, externalCustomerId: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Trang Giới thiệu (Referrer URL)
                  </label>
                  <input
                    type="text"
                    value={formData.referrer}
                    onChange={(e) => setFormData({ ...formData, referrer: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                  />
                </div>

                {/* Network Intelligence Toggles */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tùy chọn Mạng (Network Intelligence):</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVpn}
                        onChange={(e) => setFormData({ ...formData, isVpn: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-300">Phát hiện địa chỉ VPN thương mại (+20)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDatacenter}
                        onChange={(e) => setFormData({ ...formData, isDatacenter: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-300">IP thuộc Datacenter Cloud (+20)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={runSimulation}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" /> Đang đối soát...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 fill-current" /> Đánh giá
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            {!evaluationResult && !loading && (
              <div className="glass-card p-12 rounded-2xl border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Sẵn sàng Đánh giá Kịch bản (100% Tapfiliate Rules)</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Bấm nút &ldquo;Đánh giá&rdquo; để đối soát tất cả 15 thuật toán phòng chống gian lận.
                </p>
              </div>
            )}

            {evaluationResult && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 animate-fade-in min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 min-w-0">
                  <div className="space-y-1 min-w-0 max-w-full">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">Kết quả Đối soát Risk Engine</span>
                    {getDecisionBadge(evaluationResult.decision)}
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tổng Điểm Rủi Ro (Score)</span>
                      <span className={`text-3xl font-black ${
                        evaluationResult.totalScore >= 100 ? 'text-rose-400' :
                        evaluationResult.totalScore >= 70 ? 'text-amber-400' :
                        evaluationResult.totalScore >= 40 ? 'text-blue-400' :
                        'text-emerald-400'
                      }`}>
                        {evaluationResult.totalScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side by side comparison */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <ArrowRightLeft className="h-4 w-4 shrink-0" /> Bảng Đối soát Trực quan: Người Mua vs Người Giới Thiệu
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono min-w-0">
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-w-0">
                      <span className="text-[10px] font-sans text-slate-400 block font-semibold">Thông tin Người Mua:</span>
                      <div className="break-all">Email: <span className={isEmailMatched ? 'text-rose-400 font-bold' : 'text-slate-200'}>{formData.userEmail}</span></div>
                      <div className="break-all">PayPal: <span className={isPaymentMatched ? 'text-rose-400 font-bold' : 'text-slate-200'}>{formData.paymentAccount}</span></div>
                      <div className="break-all">Fingerprint: <span className={isFingerprintMatched ? 'text-amber-400 font-bold' : 'text-slate-200'}>{formData.fingerprintHash}</span></div>
                      <div className="break-all">IP: <span className={isIpMatched ? 'text-amber-400 font-bold' : 'text-slate-200'}>{formData.ip}</span></div>
                    </div>
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-w-0">
                      <span className="text-[10px] font-sans text-indigo-400 block font-semibold">Hồ sơ Affiliate (John Doe):</span>
                      <div className="break-all">Email: <span className="text-slate-200">{AFFILIATE_PROMOTER.email}</span></div>
                      <div className="break-all">PayPal: <span className="text-slate-200">{AFFILIATE_PROMOTER.paymentAccount}</span></div>
                      <div className="break-all">Fingerprint: <span className="text-indigo-400 font-bold">{AFFILIATE_PROMOTER.deviceFingerprint}</span></div>
                      <div className="break-all">IP: <span className="text-slate-200">{AFFILIATE_PROMOTER.registeredIp}</span></div>
                    </div>
                  </div>
                </div>

                {/* Signals */}
                <div className="space-y-3 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex flex-wrap items-center justify-between gap-2">
                    <span>Tín hiệu Gian lận Phát hiện ({evaluationResult.signals.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal">Ngưỡng: &lt;40 Duyệt | 40-69 Tạm giữ | 70-99 Manual | 100+ Từ chối</span>
                  </h4>

                  {evaluationResult.signals.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Không phát hiện tín hiệu trùng lặp gian lận nào với người giới thiệu. Giao dịch hợp lệ!</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5 min-w-0">
                      {evaluationResult.signals.map((sig: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4 min-w-0"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 shrink-0">
                                {sig.type}
                              </span>
                              <span className="text-xs text-slate-200 font-medium break-words">{sig.reason}</span>
                            </div>
                            {sig.metadata && (
                              <div className="text-[11px] font-mono text-slate-400 pt-1 break-all bg-slate-950/60 p-2 rounded border border-slate-800/80 overflow-x-auto max-w-full">
                                {JSON.stringify(sig.metadata)}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-black text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-800/50 shrink-0">
                            +{sig.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs min-w-0">
                  <span className="font-bold text-slate-300 block">Thông tin Lưu vết CSDL (Audit Log):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 font-mono text-[11px] min-w-0">
                    <div className="break-all">Mã Đánh giá (Risk ID): <span className="text-slate-200">{evaluationResult.riskScoreId}</span></div>
                    <div className="break-all">Mã Đơn hàng (Order ID): <span className="text-slate-200">{evaluationResult.orderId}</span></div>
                    <div className="break-all">Affiliate ID: <span className="text-slate-200">{evaluationResult.affiliateId}</span></div>
                    <div className="break-all">ID Người mua: <span className="text-slate-200">{evaluationResult.userId}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
