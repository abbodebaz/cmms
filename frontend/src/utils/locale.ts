/**
 * Saudi localization helpers (formats only — no translations here).
 *
 * - Western digits (0-9) are always used, even in Arabic.
 * - Hijri dates use the Umm al-Qura calendar via Intl (no extra deps).
 */

const ARABIC_INDIC_DIGITS = /[٠-٩۰-۹]/g;

/** Replace Arabic-Indic / Persian digits with Western digits (0-9). */
export const toLatinDigits = (value: string): string =>
  value.replace(ARABIC_INDIC_DIGITS, (d) => {
    const code = d.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });

/** Number formatting that never produces Arabic-Indic digits. */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat('en-US', options).format(value);
  } catch (e) {
    return String(value);
  }
};

const HIJRI_LOCALE = 'ar-SA-u-ca-islamic-umalqura-nu-latn';
const HIJRI_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
};

/**
 * Formats a date in the Hijri (Umm al-Qura) calendar, e.g. "2 جمادى الأولى 1448 هـ".
 * Returns an empty string for empty/invalid input.
 */
export const formatHijri = (
  date: Date | string | number | null | undefined,
  timeZone?: string
): string => {
  if (date === null || date === undefined || date === '') return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  try {
    return toLatinDigits(
      new Intl.DateTimeFormat(HIJRI_LOCALE, {
        ...HIJRI_OPTIONS,
        ...(timeZone ? { timeZone } : {})
      }).format(d)
    );
  } catch (e) {
    try {
      return toLatinDigits(
        new Intl.DateTimeFormat(HIJRI_LOCALE, HIJRI_OPTIONS).format(d)
      );
    } catch (err) {
      return '';
    }
  }
};

// ─── Hijri display preference (per browser) ──────────────────────────────────

export const HIJRI_PREFERENCE_KEY = 'showHijriDates';
export const HIJRI_PREFERENCE_EVENT = 'hijri-preference-change';

let memoryPreference: boolean | null = null;

/** Stored preference, or default ON for Arabic only. */
export const getShowHijri = (language?: string): boolean => {
  if (memoryPreference !== null) return memoryPreference;
  try {
    const stored = localStorage.getItem(HIJRI_PREFERENCE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch (e) {
    // storage unavailable — fall through to default
  }
  return (language ?? '').toLowerCase().startsWith('ar');
};

export const setShowHijri = (value: boolean): void => {
  memoryPreference = value;
  try {
    localStorage.setItem(HIJRI_PREFERENCE_KEY, String(value));
  } catch (e) {
    // storage unavailable — preference only lasts for this page view
  }
  try {
    window.dispatchEvent(new Event(HIJRI_PREFERENCE_EVENT));
  } catch (e) {
    // ignore
  }
};
