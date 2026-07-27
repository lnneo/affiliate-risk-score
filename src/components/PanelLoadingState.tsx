'use client';

import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

type PanelLoadingStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export default function PanelLoadingState({ title, description, icon }: PanelLoadingStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center px-6 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
        {icon ?? <RefreshCw className="h-8 w-8 animate-spin" />}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-bold text-slate-200">{title}</h3>
        {description ? <p className="text-xs text-slate-400 leading-relaxed">{description}</p> : null}
      </div>
    </div>
  );
}
