export const LOCALES = ['vi', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'linkpul_locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'vi' || value === 'en';
}

export function resolveBrowserLocale(language = ''): Locale {
  const normalized = language.toLowerCase();
  if (normalized.startsWith('vi')) {
    return 'vi';
  }
  if (normalized.startsWith('en')) {
    return 'en';
  }
  return DEFAULT_LOCALE;
}

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore storage access errors
  }

  return resolveBrowserLocale(window.navigator.language || window.navigator.languages?.[0] || '');
}
