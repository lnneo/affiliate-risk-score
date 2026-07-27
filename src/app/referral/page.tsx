'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
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
  CheckCircle2
} from 'lucide-react';

export default function ReferralGeneratorPage() {
  const [affiliateId, setAffiliateId] = useState('aff_john_doe');
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState(false);
  const [origin, setOrigin] = useState('http://localhost:3000');
  const [lanIp, setLanIp] = useState('192.168.20.24');
  
  const [myFingerprint, setMyFingerprint] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registeredMsg, setRegisteredMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      const host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        setLanIp(host);
      }
    }

    // Load FingerprintJS on current device
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
        setRegisteredMsg(`Đã lưu Fingerprint (${myFingerprint.slice(0, 8)}...) làm thiết bị gốc!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const localLink = `${origin}/ref/${affiliateId}`;
  const networkLink = `http://${lanIp}:3000/ref/${affiliateId}`;

  const copyToClipboard = (text: string, type: 'local' | 'network') => {
    navigator.clipboard.writeText(text);
    if (type === 'local') {
      setCopiedLocal(true);
      setTimeout(() => setCopiedLocal(false), 2000);
    } else {
      setCopiedNetwork(true);
      setTimeout(() => setCopiedNetwork(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8 min-w-0">
        {/* Header */}
        <div className="space-y-3 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Share2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            Trung tâm Tạo Link Giới thiệu Thật
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl break-words">
            Tạo & Gửi Link Giới thiệu (Real Device Testing)
          </h1>
          <p className="text-slate-400 max-w-3xl text-sm leading-relaxed break-words">
            Sử dụng trang này để lấy Link Giới thiệu thật. Khi bạn hoặc đồng nghiệp mở link này trên máy thật/điện thoại, trình duyệt sẽ tự động thu thập **FingerprintJS thực tế**, **IP thực tế** và **Session Cookie thực tế** gửi về Risk Engine.
          </p>
        </div>

        {/* Affiliate Selector & Device Registration */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 min-w-0">
            <div className="min-w-0">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Chọn ID Người Giới thiệu (Affiliate ID):
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

            {/* Sync Device Button */}
            <div className="space-y-2 text-left md:text-right min-w-0">
              <span className="text-[11px] text-slate-400 block font-mono break-all">
                Fingerprint máy bạn: <span className="text-indigo-400 font-bold">{myFingerprint || 'Đang quét...'}</span>
              </span>
              <button
                onClick={handleRegisterDeviceAsAffiliate}
                disabled={registering || !myFingerprint}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 max-w-full"
              >
                <Fingerprint className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="break-words">{registering ? 'Đang đăng ký...' : 'Đăng ký thiết bị'}</span>
              </button>
              {registeredMsg && (
                <div className="text-xs text-emerald-400 font-medium flex items-center justify-start md:justify-end gap-1 break-words">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> <span className="break-all">{registeredMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Link Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          {/* Local Link Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2 truncate">
                  <Laptop className="h-5 w-5 text-indigo-400 shrink-0" />
                  1. Link Test trên Máy Hiện Tại (Local)
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-mono font-semibold shrink-0">
                  Localhost
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed break-words">
                Mở trực tiếp trên trình duyệt khác trên máy bạn (hoặc tab Ẩn danh Incognito) để test đối soát trùng thiết bị/IP với Affiliate.
              </p>

              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-300 break-all overflow-x-auto max-w-full">
                {localLink}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 min-w-0">
              <button
                onClick={() => copyToClipboard(localLink, 'local')}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                {copiedLocal ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                <span>{copiedLocal ? 'Đã sao chép!' : 'Sao chép'}</span>
              </button>
              <a
                href={localLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <ExternalLink className="h-4 w-4 shrink-0" /> <span>Mở link</span>
              </a>
            </div>
          </div>

          {/* Network LAN Link Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2 truncate">
                  <Wifi className="h-5 w-5 text-emerald-400 shrink-0" />
                  2. Link Gửi Đồng Nghiệp (Cùng Mạng Wi-Fi)
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-semibold shrink-0">
                  LAN Wi-Fi
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed break-words">
                Gửi đường link này qua Slack/Zalo cho **đồng nghiệp** hoặc mở trên **điện thoại di động** bắt cùng mạng Wi-Fi.
              </p>

              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 break-all overflow-x-auto max-w-full">
                {networkLink}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 min-w-0">
              <button
                onClick={() => copyToClipboard(networkLink, 'network')}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                {copiedNetwork ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                <span>{copiedNetwork ? 'Đã sao chép!' : 'Sao chép'}</span>
              </button>
              <a
                href={networkLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <ExternalLink className="h-4 w-4 shrink-0" /> <span>Mở link</span>
              </a>
            </div>
          </div>
        </div>

        {/* Testing Guide Steps */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 min-w-0">
          <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400 shrink-0" />
            Các Bước Thử nghiệm Thực tế Chuẩn:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs min-w-0">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
              <span className="font-bold text-indigo-400 text-sm block">Bước 1: Đăng ký Vân tay máy bạn</span>
              <p className="text-slate-400 leading-relaxed break-words">
                Bấm nút **&ldquo;Đăng ký thiết bị&rdquo;** ở trên để hệ thống ghi nhận Fingerprint thực tế của máy bạn làm thiết bị Affiliate chủ.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
              <span className="font-bold text-indigo-400 text-sm block">Bước 2: Mở trình duyệt khác / Gửi đồng nghiệp</span>
              <p className="text-slate-400 leading-relaxed break-words">
                - Nếu mở trình duyệt khác trên **máy bạn** $\rightarrow$ Hệ thống phát hiện Fingerprint phần cứng trùng máy bạn $\rightarrow$ **Cảnh báo/Chờ duyệt (+70 điểm)**.
                - Nếu **đồng nghiệp** mở trên máy khác $\rightarrow$ Fingerprint khác hoàn toàn $\rightarrow$ **DUYỆT (APPROVE - 0 điểm)**!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 min-w-0">
              <span className="font-bold text-indigo-400 text-sm block">Bước 3: Kiểm tra Admin Audit Ledger</span>
              <p className="text-slate-400 leading-relaxed break-words">
                Quay lại trang **Nhật ký Audit Admin (`/admin/dashboard`)**, bạn sẽ thấy giao dịch xuất hiện với đúng Fingerprint & IP máy thật và kết quả đối soát chính xác!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
