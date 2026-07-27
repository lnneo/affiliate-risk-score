'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { en } from './dictionaries/en';
import { vi, type Dictionary } from './dictionaries/vi';
import {
  DEFAULT_LOCALE,
  detectInitialLocale,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './locales';

const dictionaries: Record<Locale, Dictionary> = {
  en,
  vi,
};

type I18nContextValue = {
  locale: Locale;
  ready: boolean;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = detectInitialLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial;
    setReady(true);
  }, []);

  const setLocale = (next: Locale) => {
    if (!isLocale(next)) {
      return;
    }
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore storage access errors
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale];
    return {
      locale,
      ready,
      dictionary,
      setLocale,
      t: dictionary,
    };
  }, [locale, ready]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
