'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import LoadingButton from '@/components/LoadingButton';
import PanelLoadingState from '@/components/PanelLoadingState';
import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import { useI18n } from '@/i18n/I18nProvider';
import { replaceCount, resolveFraudSignalReason } from '@/i18n/format';
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
  Laptop
} from 'lucide-react';

function StoreCheckoutContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  
  const [affiliateId, setAffiliateId] = useState('aff_john_doe');
  const [userEmail, setUserEmail] = useState('buyer.real.user@gmail.com');
  const [paymentAccount, setPaymentAccount] = useState('card_real_visa_1234');
  const [cookieId, setCookieId] = useState('');
  const [fingerprintHash, setFingerprintHash] = useState('');
  
  const [loadingFp, setLoadingFp] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const { sourceRef: orderPanelRef, minHeight: orderPanelMinHeight } = useSyncedPanelMinHeight<HTMLDivElement>();

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
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-base glow-emerald max-w-full">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="break-words">{t.decision.APPROVE.badge}</span>
          </div>
        );
      case 'PENDING_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-base max-w-full">
            <Clock className="h-5 w-5 shrink-0" />
            <span className="break-words">{t.decision.PENDING_REVIEW.badge}</span>
          </div>
        );
      case 'MANUAL_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-base glow-amber max-w-full">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="break-words">{t.decision.MANUAL_REVIEW.badge}</span>
          </div>
        );
      case 'REJECT':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-base glow-rose max-w-full">
            <XCircle className="h-5 w-5 shrink-0" />
            <span className="break-words">{t.decision.REJECT.badge}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8 min-w-0">
      {/* Header */}
      <div className="space-y-3 min-w-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <ShoppingBag className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          {t.store.eyebrow}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl break-words">
          {t.store.title}
        </h1>
        <p className="text-slate-400 max-w-3xl text-sm leading-relaxed break-words">
          {t.store.descriptionPrefix} <span className="font-mono text-indigo-400 font-bold break-all">{affiliateId}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start min-w-0">
        {/* Left Form */}
        <div className="lg:col-span-5 min-w-0">
          <div
            ref={orderPanelRef}
            className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 min-w-0"
          >
            <div className="border-b border-slate-800 pb-4">
              <h2 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-400 shrink-0" />
                {t.store.checkoutTitle}
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <Key className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> {t.store.affiliateIdLabel}
                </label>
                <input
                  type="text"
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> {t.store.buyerEmailLabel}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> {t.store.paymentLabel}
                </label>
                <input
                  type="text"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
                />
              </div>

              {/* Detected Real Device Info */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
                <span className="text-slate-400 font-bold block flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> {t.store.fingerprintSection}
                </span>
                {loadingFp ? (
                  <span className="text-slate-500 text-[11px] animate-pulse">{t.store.scanningFp}</span>
                ) : (
                  <div className="font-mono text-[11px] space-y-1 min-w-0">
                    <div className="break-all">{t.store.fingerprintHash} <span className="text-indigo-400 font-bold break-all">{fingerprintHash}</span></div>
                    <div className="break-all">{t.store.cookieId} <span className="text-slate-300 break-all">{cookieId || t.store.autoCookie}</span></div>
                  </div>
                )}
              </div>
            </div>

            <LoadingButton
              onClick={handleCheckout}
              loading={evaluating}
              loadingText={t.store.paying}
              icon={<ShoppingBag className="h-5 w-5 shrink-0" />}
              spinnerClassName="h-5 w-5"
              disabled={loadingFp}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 font-bold text-white shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {t.store.pay}
            </LoadingButton>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 min-w-0">
          <div
            className="glass-card rounded-2xl border border-slate-800 min-w-0 flex flex-col"
            style={orderPanelMinHeight ? { minHeight: `${orderPanelMinHeight}px` } : undefined}
          >
            {evaluating ? (
              <PanelLoadingState
                title={t.store.loadingTitle}
                description={t.store.loadingBody}
              />
            ) : evaluationResult ? (
            <div className="p-6 space-y-6 animate-fade-in min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 min-w-0">
                <div className="space-y-1 min-w-0 max-w-full">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">{t.store.resultTitle}</span>
                  {getDecisionBadge(evaluationResult.decision)}
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">{t.store.totalScore}</span>
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
              <div className="space-y-3 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {replaceCount(t.store.signalsTitle, evaluationResult.signals.length)}
                </h4>

                {evaluationResult.signals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{t.store.cleanSignals}</span>
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
                            <span className="text-xs text-slate-200 font-medium break-words">
                              {resolveFraudSignalReason(sig, t.fraudReasons)}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-800/50 shrink-0">
                          +{sig.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 break-words">
                {t.store.savedNote}
              </div>
            </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center px-6 py-12">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">{t.store.readyTitle}</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  {t.store.readyBody}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StoreCheckoutPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">{t.store.suspenseLoading}</div>}>
        <StoreCheckoutContent />
      </Suspense>
    </div>
  );
}
