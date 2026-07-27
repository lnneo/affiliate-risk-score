'use client';

import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

type TableOverlayProps = {
  loading: boolean;
  children: ReactNode;
  label?: string;
};

export default function TableOverlay({ loading, children, label = 'Đang tải dữ liệu...' }: TableOverlayProps) {
  return (
    <div className="relative min-h-[280px]">
      {children}
      {loading ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-950/75 backdrop-blur-[1px]"
          aria-busy="true"
          aria-live="polite"
        >
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
          <span className="text-xs font-medium text-slate-300">{label}</span>
        </div>
      ) : null}
    </div>
  );
}
