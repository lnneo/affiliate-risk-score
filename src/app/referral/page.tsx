'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingButton from '@/components/LoadingButton';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {
  Share2,
  Copy,
  ExternalLink,
  Check,
  Laptop,
  Wifi,
  Users,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function buildLanOrigin(hostname: string, port: string) {
  const host = hostname || '192.168.20.24';
  const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ':3000';
  return `http://${host}${portSuffix}`;
}

export default function ReferralGeneratorPage() {
  const { t } = useI18n();
  const [affiliateId, setAffiliateId] = useState('aff_john_doe');
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [origin, setOrigin] = useState('');
  const [lanOrigin, setLanOrigin] = useState('');
  const [isLocalDev, setIsLocalDev] = useState(false);

  const [myFingerprint, setMyFingerprint] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registeredMsg, setRegisteredMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentOrigin = window.location.origin;
    const hostname = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const local = isLocalHostname(hostname);

    setOrigin(currentOrigin);
    setIsLocalDev(local);

    if (local) {
      setLanOrigin(buildLanOrigin('192.168.20.24', port || '3000'));
    } else {
      setLanOrigin('');
    }

    async function loadFp() {
      try {
        const fp = await FingerprintJS.load();
        const res = await fp.get();
        setMyFingerprint(res.visitorId);
      } catch (err) {
        console.error(err);
      }
    }
    loadFp();
  }, []);

  const handleRegisterDeviceAsAffiliate = async () => {
    setRegistering(true);
    setRegisteredMsg('');
    try {
      const res = await fetch('/api/admin/register-affiliate-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId,
          fingerprintHash: myFingerprint,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredMsg(`${t.referral.registered} (${myFingerprint.slice(0, 8)}...)`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const currentLink = origin ? `${origin}/ref/${affiliateId}` : `/ref/${affiliateId}`;
  const shareLink = isLocalDev && lanOrigin ? `${lanOrigin}/ref/${affiliateId}` : currentLink;

  const copyToClipboard = (text: string, type: 'current' | 'share') => {
    navigator.clipboard.writeText(text);
    if (type === 'current') {
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2000);
    } else {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8 min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Share2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            {t.referral.eyebrow}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl break-words">
            {t.referral.title}
          </h1>
          <p className="text-slate-400 max-w-3xl text-sm leading-relaxed break-words">
            {t.referral.description}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 min-w-0">
            <div className="min-w-0">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                {t.referral.affiliateIdLabel}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 font-mono text-sm focus:border-indigo-500 focus:outline-none min-w-[240px] max-w-full break-all"
                />
              </div>
            </div>

            <div className="space-y-2 text-left md:text-right min-w-0">
              <span className="text-[11px] text-slate-400 block font-mono break-all">
                {t.referral.fingerprintLabel}{' '}
                <span className="text-indigo-400 font-bold">{myFingerprint || t.common.scanning}</span>
              </span>
              <LoadingButton
                onClick={handleRegisterDeviceAsAffiliate}
                loading={registering}
                loadingText={t.referral.registering}
                icon={<Fingerprint className="h-4 w-4 text-amber-400 shrink-0" />}
                disabled={!myFingerprint}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 max-w-full"
              >
                {t.referral.registerDevice}
              </LoadingButton>
              {registeredMsg ? (
                <div className="text-xs text-emerald-400 font-medium flex items-center justify-start md:justify-end gap-1 break-words">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> <span className="break-all">{registeredMsg}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2 truncate">
                  <Laptop className="h-5 w-5 text-indigo-400 shrink-0" />
                  {t.referral.currentDeviceTitle}
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-mono font-semibold shrink-0">
                  {t.referral.currentDeviceBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed break-words">{t.referral.currentDeviceDesc}</p>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-300 break-all overflow-x-auto max-w-full">
                {currentLink}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 min-w-0">
              <button
                onClick={() => copyToClipboard(currentLink, 'current')}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                {copiedCurrent ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                <span>{copiedCurrent ? t.common.copied : t.common.copy}</span>
              </button>
              <a
                href={currentLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <ExternalLink className="h-4 w-4 shrink-0" /> <span>{t.common.openLink}</span>
              </a>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2 truncate">
                  <Wifi className="h-5 w-5 text-emerald-400 shrink-0" />
                  {isLocalDev ? t.referral.lanTitle : t.referral.shareTitle}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-semibold shrink-0">
                  {isLocalDev ? t.referral.lanBadge : t.referral.shareBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed break-words">
                {isLocalDev ? t.referral.lanDesc : t.referral.shareDesc}
              </p>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 break-all overflow-x-auto max-w-full">
                {shareLink}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 min-w-0">
              <button
                onClick={() => copyToClipboard(shareLink, 'share')}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                {copiedShare ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                <span>{copiedShare ? t.common.copied : t.common.copy}</span>
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <ExternalLink className="h-4 w-4 shrink-0" /> <span>{t.common.openLink}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 min-w-0">
          <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400 shrink-0" />
            {t.referral.guideTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs min-w-0">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
              <span className="font-bold text-indigo-400 text-sm block">{t.referral.step1Title}</span>
              <p className="text-slate-400 leading-relaxed break-words">{t.referral.step1Body}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
              <span className="font-bold text-indigo-400 text-sm block">{t.referral.step2Title}</span>
              <p className="text-slate-400 leading-relaxed break-words">{t.referral.step2Body}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
              <span className="font-bold text-indigo-400 text-sm block">{t.referral.step3Title}</span>
              <p className="text-slate-400 leading-relaxed break-words">{t.referral.step3Body}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
