'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, PlayCircle, LayoutDashboard, Sliders, Sparkles, Share2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMsg('Đã khởi tạo dữ liệu!');
        setTimeout(() => setSeedMsg(''), 3000);
        window.location.reload();
      }
    } catch (err: any) {
      setSeedMsg('Lỗi khởi tạo');
    } finally {
      setSeeding(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Giả lập Gian lận', icon: PlayCircle },
    { href: '/referral', label: 'Tạo Link Thật (Test Máy Thật)', icon: Share2 },
    { href: '/store', label: 'Cửa hàng Mua hàng', icon: ShoppingBag },
    { href: '/admin/dashboard', label: 'Nhật ký Audit Admin', icon: LayoutDashboard },
    { href: '/admin/config', label: 'Cấu hình Luật', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-100">LinkPul</span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                Risk Engine v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Hệ thống Phát hiện Gian lận Affiliate</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {seedMsg && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              {seedMsg}
            </span>
          )}
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700/80 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-sm transition-all hover:bg-slate-700 hover:border-slate-600 active:scale-95 disabled:opacity-50"
            title="Nạp dữ liệu thử nghiệm mẫu"
          >
            <Sparkles className={`h-3.5 w-3.5 text-amber-400 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Đang nạp...' : 'Nạp Dữ liệu Mẫu'}
          </button>
        </div>
      </div>
    </header>
  );
}
