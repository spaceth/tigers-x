/**
 * Locale copy for the public site. English is the live language. Thai files
 * exist so a translation can be filled in without touching the React tree.
 *
 * Camera poses, mesh indices, numeric facts, and asset paths stay in
 * `src/config`. Those are not words.
 *
 * Turn Thai on by adding `'th'` to `availableLocales` below.
 */
import en from './en.json';
import specEn from './spec.en.json';
import th from './th.json';
import specTh from './spec.th.json';

export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Languages a visitor can select. `'en'` is always on. Add `'th'` here when
 * `th.json` and `spec.th.json` have been translated.
 */
export const availableLocales: Locale[] = ['en'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
};

export type Copy = typeof en;
export type SpecCopy = typeof specEn;

const copyByLocale: Record<Locale, Copy> = { en, th };
const specByLocale: Record<Locale, SpecCopy> = { en: specEn, th: specTh };

const STORAGE_KEY = 'tigers-x-locale';

export function isLocaleAvailable(id: Locale): boolean {
  return availableLocales.includes(id);
}

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && locales.includes(stored as Locale) && isLocaleAvailable(stored as Locale)) {
      return stored as Locale;
    }
  } catch {
    /* private mode */
  }
  return defaultLocale;
}

export const locale: Locale = typeof document === 'undefined' ? defaultLocale : readStoredLocale();
export const copy: Copy = copyByLocale[locale];
export const specCopy: SpecCopy = specByLocale[locale];

export function setLocale(next: Locale) {
  if (!isLocaleAvailable(next) || next === locale) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode */
  }
  document.documentElement.lang = next;
  location.reload();
}

export function applyDocumentLocale() {
  document.documentElement.lang = locale;
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}
