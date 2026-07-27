import { describe, expect, it } from 'vitest';

import { resolveBrowserLocale } from '../locales';

describe('resolveBrowserLocale', () => {
  it('maps Vietnamese browser languages to vi', () => {
    expect(resolveBrowserLocale('vi')).toBe('vi');
    expect(resolveBrowserLocale('vi-VN')).toBe('vi');
  });

  it('maps English browser languages to en', () => {
    expect(resolveBrowserLocale('en')).toBe('en');
    expect(resolveBrowserLocale('en-US')).toBe('en');
  });

  it('falls back to en for unsupported languages', () => {
    expect(resolveBrowserLocale('fr-FR')).toBe('en');
    expect(resolveBrowserLocale('')).toBe('en');
  });
});
