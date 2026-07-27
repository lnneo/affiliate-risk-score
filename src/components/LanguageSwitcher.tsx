'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/locales';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
      <span className="sr-only">{t.language.label}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
        aria-label={t.language.label}
      >
        <option value="vi">{t.language.vi}</option>
        <option value="en">{t.language.en}</option>
      </select>
    </label>
  );
}
