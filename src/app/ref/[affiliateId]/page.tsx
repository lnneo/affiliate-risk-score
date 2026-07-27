'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import LoadingButton from '@/components/LoadingButton';
import { useRouter } from 'next/navigation';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

export default function RealReferralLandingPage({ params }: { params: Promise<{ affiliateId: string }> }) {
  const resolvedParams = use(params);
  const affiliateId = resolvedParams.affiliateId || 'aff_john_doe';
  const router = useRouter();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [clickResult, setClickResult] = useState<any>(null);
  const [realFingerprint, setRealFingerprint] = useState<string>('');

  const goToStore = () => {
    setNavigating(true);
    router.push(`/store?affiliateId=${affiliateId}&cookieId=${clickResult?.cookieId}&fp=${realFingerprint}`);
  };

  useEffect(() => {
    async function captureAndTrack() {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        setRealFingerprint(visitorId);

        let cookieId = localStorage.getItem('aff_cookie_id');
        if (!cookieId) {
          cookieId = `ck_real_${visitorId.slice(0, 8)}_${Date.now()}`;
          localStorage.setItem('aff_cookie_id', cookieId);
        }

        const res = await fetch('/api/tracking/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            affiliateId,
            cookieId,
            fingerprintHash: visitorId,
            fingerprintDetails: {
              browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Safari',
              os: navigator.platform,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language,
              screen: `${window.screen.width}x${window.screen.height}`,
            },
          }),
        });

        const data = await res.json();
        setClickResult(data);

        setTimeout(() => {
          router.push(`/store?affiliateId=${affiliateId}&cookieId=${cookieId}&fp=${visitorId}`);
        }, 2500);
      } catch (err) {
        console.error('Error capturing real fingerprint:', err);
      } finally {
        setLoading(false);
      }
    }

    captureAndTrack();
  }, [affiliateId, router]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center space-y-8 flex flex-col items-center justify-center min-w-0">
        {loading ? (
          <div className="glass-card p-12 rounded-3xl border border-slate-800 space-y-4 max-w-md w-full min-w-0">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shrink-0">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 break-words">{t.refLanding.loadingTitle}</h2>
            <p className="text-xs text-slate-400 break-words">{t.refLanding.loadingBody}</p>
          </div>
        ) : (
          <div className="glass-card p-10 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-6 max-w-xl w-full animate-fade-in min-w-0">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto glow-emerald shrink-0">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2 min-w-0">
              <h2 className="text-2xl font-extrabold text-slate-100 break-words">{t.refLanding.successTitle}</h2>
              <p className="text-xs text-slate-400 break-words">{t.refLanding.successBody}</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-left space-y-2 min-w-0">
              <div className="text-slate-400 font-sans font-bold border-b border-slate-800 pb-2 flex flex-wrap justify-between gap-2">
                <span>{t.refLanding.collectedTitle}</span>
                <span className="text-emerald-400 break-all">
                  {t.refLanding.ref} {affiliateId}
                </span>
              </div>
              <div className="text-slate-300 break-all">
                {t.refLanding.fingerprintHash}{' '}
                <span className="text-indigo-400 font-bold break-all">{realFingerprint}</span>
              </div>
              <div className="text-slate-300 break-all">
                {t.refLanding.cookieId}{' '}
                <span className="text-slate-200 break-all">{clickResult?.cookieId}</span>
              </div>
              <div className="text-slate-300 break-all">
                {t.refLanding.ipDevice}{' '}
                <span className="text-slate-200 break-all">{clickResult?.clientIp || t.refLanding.ipFallback}</span>
              </div>
            </div>

            <div className="pt-2 min-w-0">
              <LoadingButton
                onClick={goToStore}
                loading={navigating}
                loadingText={t.refLanding.navigating}
                icon={<ArrowRight className="h-4 w-4 shrink-0" />}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 font-bold text-white shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {t.refLanding.goToStore}
              </LoadingButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
