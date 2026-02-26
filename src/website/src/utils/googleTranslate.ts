'use client';

const GOOGTRANS_COOKIE_NAME = 'googtrans';
const GOOGLE_TRANSLATE_COMBO_SELECTOR = '.goog-te-combo';
const DEFAULT_GOOGLE_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'airqo_selected_language';

const LANGUAGE_CODE_ALIASES: Record<string, string> = {
  'en-gb': 'en',
  'en-us': 'en',
};

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  if (!cookie) return undefined;
  return decodeURIComponent(cookie.substring(name.length + 1).trim());
};

const getDomainCandidates = (): string[] => {
  if (typeof window === 'undefined') return [];

  const hostname = window.location.hostname.replace(/^www\./, '');
  if (!hostname || hostname === 'localhost') return [];

  const candidates = new Set<string>([hostname, `.${hostname}`]);
  const parts = hostname.split('.');

  if (parts.length > 2) {
    const apex = parts.slice(-2).join('.');
    candidates.add(apex);
    candidates.add(`.${apex}`);
  }

  return Array.from(candidates);
};

const clearGoogTransCookie = () => {
  if (typeof document === 'undefined') return;

  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `${GOOGTRANS_COOKIE_NAME}=; path=/; expires=${expires}; SameSite=Lax`;

  getDomainCandidates().forEach((domain) => {
    document.cookie = `${GOOGTRANS_COOKIE_NAME}=; path=/; domain=${domain}; expires=${expires}; SameSite=Lax`;
  });
};

const setGoogTransCookie = (cookieValue: string) => {
  if (typeof document === 'undefined') return;

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${GOOGTRANS_COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax`;

  getDomainCandidates().forEach((domain) => {
    document.cookie = `${GOOGTRANS_COOKIE_NAME}=${cookieValue}; path=/; domain=${domain}; max-age=${maxAge}; SameSite=Lax`;
  });
};

export const normalizeGoogleLanguageCode = (languageCode: string): string => {
  const normalized = languageCode.trim();
  return LANGUAGE_CODE_ALIASES[normalized.toLowerCase()] || normalized;
};

export const setPersistedLanguageCode = (languageCode: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.warn('Unable to persist selected language:', error);
  }
};

export const getPersistedLanguageCode = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read persisted language:', error);
    return null;
  }
};

export const getGoogleTranslateTargetLanguage = (): string | null => {
  const cookie = getCookieValue(GOOGTRANS_COOKIE_NAME);
  if (!cookie) return null;

  const parts = cookie.split('/');
  return parts[parts.length - 1] || null;
};

export const isGoogleTranslationActive = (): boolean => {
  const currentLanguage = getGoogleTranslateTargetLanguage();
  return (
    !!currentLanguage &&
    currentLanguage.toLowerCase() !== DEFAULT_GOOGLE_LANGUAGE
  );
};

export const setGoogleTranslateLanguageCookie = (languageCode: string) => {
  const normalizedCode = normalizeGoogleLanguageCode(languageCode);
  const cookieValue = `/auto/${normalizedCode}`;

  clearGoogTransCookie();
  setGoogTransCookie(cookieValue);
};

const waitForTranslateCombo = async (
  timeoutMs: number,
): Promise<HTMLSelectElement | null> => {
  if (typeof document === 'undefined') return null;

  const existing = document.querySelector(
    GOOGLE_TRANSLATE_COMBO_SELECTOR,
  ) as HTMLSelectElement | null;
  if (existing) return existing;

  const started = Date.now();

  return new Promise((resolve) => {
    const intervalId = window.setInterval(() => {
      const combo = document.querySelector(
        GOOGLE_TRANSLATE_COMBO_SELECTOR,
      ) as HTMLSelectElement | null;

      if (combo) {
        window.clearInterval(intervalId);
        resolve(combo);
        return;
      }

      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(intervalId);
        resolve(null);
      }
    }, 80);
  });
};

const resolveLanguageForCombo = (
  requestedCode: string,
  combo: HTMLSelectElement,
): string => {
  const optionCodes = Array.from(combo.options).map((option) => option.value);
  const optionsMap = new Map(
    optionCodes.map((code) => [code.toLowerCase(), code]),
  );

  const normalizedRequested = normalizeGoogleLanguageCode(requestedCode);
  const exactMatch = optionsMap.get(normalizedRequested.toLowerCase());
  if (exactMatch) return exactMatch;

  const primaryCode = normalizedRequested.split('-')[0];
  const primaryMatch = optionsMap.get(primaryCode.toLowerCase());
  if (primaryMatch) return primaryMatch;

  return optionsMap.get(DEFAULT_GOOGLE_LANGUAGE) || DEFAULT_GOOGLE_LANGUAGE;
};

export const applyGoogleTranslateLanguage = async (
  languageCode: string,
  timeoutMs: number = 3000,
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  setGoogleTranslateLanguageCookie(languageCode);

  const combo = await waitForTranslateCombo(timeoutMs);
  if (!combo) return false;

  const resolvedCode = resolveLanguageForCombo(languageCode, combo);
  setGoogleTranslateLanguageCookie(resolvedCode);

  if (combo.value !== resolvedCode) {
    combo.value = resolvedCode;
  }

  combo.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
};
