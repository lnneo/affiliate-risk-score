'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { 
  ShoppingBag, 
  CreditCard, 
  Mail, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  Laptop
} from 'lucide-react';

function StoreCheckoutContent() {
  const searchParams = useSearchParams();
  
  const [affiliateId, setAffiliateId] = useState('aff_john_doe');
  const [userEmail, setUserEmail] = useState('buyer.real.user@gmail.com');
  const [paymentAccount, setPaymentAccount] = useState('card_real_visa_1234');
  const [cookieId, setCookieId] = useState('');
  const [fingerprintHash, setFingerprintHash] = useState('');
  
  const [loadingFp, setLoadingFp] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  useEffect(() => {
    async function initClientData() {
      try {
        const paramAff = searchParams.get('affiliateId');
        const paramCookie = searchParams.get('cookieId');
        const paramFp = searchParams.get('fp');

        if (paramAff) setAffiliateId(paramAff);
        if (paramCookie) setCookieId(paramCookie);

        if (paramFp) {
          setFingerprintHash(paramFp);
        } else {
          // Load real FingerprintJS on the browser
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          setFingerprintHash(result.visitorId);
        }

        const storedCookie = localStorage.getItem('aff_cookie_id');
        if (!paramCookie && storedCookie) {
          setCookieId(storedCookie);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFp(false);
      }
    }

    initClientData();
  }, [searchParams]);

  const handleCheckout = async () => {
    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/checkout/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId,
          userEmail,
          paymentAccount,
          cookieId: cookieId || `ck_real_${Date.now()}`,
          fingerprintHash,
          amount: 99.00,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEvaluationResult(json.evaluation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'APPROVE':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-base glow-emerald">
            <CheckCircle2 className="h-5 w-5" />
            <span>DUYỆT HOA HỒNG (APPROVE - Giao dịch hợp lệ)</span>
          </div>
        );
      case 'PENDING_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-base">
            <Clock className="h-5 w-5" />
            <span>TẠM GIỮ CHỜ DUYỆT (PENDING REVIEW)</span>
          </div>
        );
      case 'MANUAL_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-base glow-amber">
            <AlertTriangle className="h-5 w-5" />
            <span>CẦN KIỂM TRA THỦ CÔNG (MANUAL REVIEW)</span>
          </div>
        );
      case 'REJECT':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-base glow-rose">
            <XCircle className="h-5 w-5" />
            <span>TỪ CHỐI HOA HỒNG (REJECT - Gian lận)</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
          Cửa hàng Mua hàng Thật (Real Checkout Demo)
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Cửa hàng Sản phẩm Pro Plan ($99.00)
        </h1>
        <p className="text-slate-400 max-w-3xl text-sm leading-relaxed">
          Đơn hàng này được giới thiệu bởi Affiliate <span className="font-mono text-indigo-400 font-bold">{affiliateId}</span>. Hệ thống tự động thu thập Fingerprint thực tế từ trình duyệt của bạn để tính điểm rủi ro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                Thông tin Đặt hàng Thực tế
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <Key className="h-3.5 w-3.5 text-indigo-400" /> Mã Người giới thiệu (Affiliate ID)
                </label>
                <input
                  type="text"
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" /> Email Người mua (Thử nhập email của bạn/đồng nghiệp)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-400" /> Tài khoản Thanh toán (Thẻ / PayPal)
                </label>
                <input
                  type="text"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Detected Real Device Info */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-emerald-400" /> FingerprintJS Thực tế Thu thập:
                </span>
                {loadingFp ? (
                  <span className="text-slate-500 text-[11px] animate-pulse">Đang quét phần cứng trình duyệt...</span>
                ) : (
                  <div className="font-mono text-[11px] space-y-1">
                    <div>Fingerprint Hash: <span className="text-indigo-400 font-bold">{fingerprintHash}</span></div>
                    <div>Cookie ID: <span className="text-slate-300">{cookieId || 'Cookie tự động'}</span></div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={evaluating || loadingFp}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 font-bold text-white shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" /> Đang Thanh toán & Đánh giá Risk...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Thanh toán Đơn hàng ($99.00)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          {!evaluationResult && !evaluating && (
            <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 min-h-[380px]">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Sẵn sàng Đặt hàng & Đánh giá</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Bấm nút &ldquo;Thanh toán Đơn hàng&rdquo; để mô phỏng một giao dịch thực tế. Kết quả đánh giá Risk Engine sẽ xuất hiện tại đây và được lưu vào CSDL Admin Audit Ledger.
              </p>
            </div>
          )}

          {evaluationResult && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Kết quả Thanh toán & Risk Engine</span>
                  {getDecisionBadge(evaluationResult.decision)}
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tổng Điểm Rủi Ro</span>
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

              {/* Signals */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tín hiệu Gian lận Phát hiện ({evaluationResult.signals.length})
                </h4>

                {evaluationResult.signals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Giao dịch hoàn toàn sạch! Không có tín hiệu trùng lặp vi phạm.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {evaluationResult.signals.map((sig: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              {sig.type}
                            </span>
                            <span className="text-xs text-slate-200 font-medium">{sig.reason}</span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-800/50">
                          +{sig.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                Giao dịch này đã được ghi lại trong CSDL Admin. Bạn có thể mở trang <span className="text-indigo-400 font-bold font-mono">/admin/dashboard</span> để đối soát!
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function StoreCheckoutPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Đang tải cửa hàng...</div>}>
        <StoreCheckoutContent />
      </Suspense>
    </div>
  );
}
