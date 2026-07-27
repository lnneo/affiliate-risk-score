'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import LoadingButton from '@/components/LoadingButton';
import { useI18n } from '@/i18n/I18nProvider';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  loadingText,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="glass-card w-full max-w-md rounded-2xl border border-slate-800 p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-100 break-words">
              {title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed break-words">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 p-1 shrink-0 disabled:opacity-50"
            aria-label={cancelLabel ?? t.common.cancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            {cancelLabel ?? t.common.cancel}
          </button>
          <LoadingButton
            onClick={onConfirm}
            loading={loading}
            loadingText={loadingText ?? t.common.loading}
            icon={icon}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {confirmLabel ?? t.common.confirm}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
