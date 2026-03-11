'use client';

const GOOGTRANS_COOKIE_NAME = 'googtrans';
const GOOGLE_TRANSLATE_COMBO_SELECTOR = '.goog-te-combo';
const DEFAULT_GOOGLE_LANGUAGE = 'en';
const SOURCE_GOOGLE_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'airqo_selected_language';
const MIN_COMBO_WAIT_MS = 400;

const LANGUAGE_CODE_ALIASES: Record<string, string> = {
  'en-gb': 'en',
  'en-us': 'en',
  zh: 'zh-CN',
  'zh-hans': 'zh-CN',
  'pt-br': 'pt',
  'pt-pt': 'pt',
  he: 'iw',
};

let cachedTranslateCombo: HTMLSelectElement | null = null;

const triggerGoogleTranslateInit = () => {
  if (typeof window === 'undefined') return;
  const initializer = (
    window as Window & { googleTranslateElementInit?: () => void }
  ).googleTranslateElementInit;

  if (typeof initializer === 'function') {
    initializer();
  }
};

export const isGoogleTranslateScriptBlocked = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as Window & { googleTranslateScriptBlocked?: boolean })
    .googleTranslateScriptBlocked;
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
  const cookieValue = `/${SOURCE_GOOGLE_LANGUAGE}/${normalizedCode}`;

  clearGoogTransCookie();
  setGoogTransCookie(cookieValue);
};

const toNormalizedGoogleLanguageCode = (
  languageCode: string | null | undefined,
): string | null => {
  if (!languageCode) return null;
  return normalizeGoogleLanguageCode(languageCode).trim().toLowerCase();
};

const isDefaultGoogleLanguage = (
  normalizedLanguageCode: string | null,
): boolean => {
  if (!normalizedLanguageCode) return false;

  return (
    normalizedLanguageCode === DEFAULT_GOOGLE_LANGUAGE ||
    normalizedLanguageCode.split('-')[0] === DEFAULT_GOOGLE_LANGUAGE
  );
};

const restoreGoogleTranslateLanguageCookie = (languageCode: string | null) => {
  if (!languageCode) {
    clearGoogTransCookie();
    return;
  }

  setGoogleTranslateLanguageCookie(languageCode);
};

const waitForTranslateCombo = async (
  timeoutMs: number,
): Promise<HTMLSelectElement | null> => {
  if (typeof document === 'undefined') return null;

  const existing =
    cachedTranslateCombo &&
    document.contains(cachedTranslateCombo) &&
    cachedTranslateCombo.matches(GOOGLE_TRANSLATE_COMBO_SELECTOR)
      ? cachedTranslateCombo
      : (document.querySelector(
          GOOGLE_TRANSLATE_COMBO_SELECTOR,
        ) as HTMLSelectElement | null);

  cachedTranslateCombo = existing;
  if (existing) return existing;

  return new Promise((resolve) => {
    let observer: MutationObserver | null = null;

    const timeoutId = window.setTimeout(() => {
      observer?.disconnect();
      resolve(null);
    }, timeoutMs);

    observer = new MutationObserver(() => {
      const combo = document.querySelector(
        GOOGLE_TRANSLATE_COMBO_SELECTOR,
      ) as HTMLSelectElement | null;

      if (combo) {
        cachedTranslateCombo = combo;
        window.clearTimeout(timeoutId);
        observer?.disconnect();
        resolve(combo);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const isDomTranslationActive = (): boolean => {
  if (typeof document === 'undefined') return false;

  return (
    document.body.classList.contains('translated-ltr') ||
    document.body.classList.contains('translated-rtl')
  );
};

const waitForDomTranslationState = async (
  shouldBeActive: boolean,
  timeoutMs: number,
): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  const isExpectedState = () =>
    shouldBeActive ? isDomTranslationActive() : !isDomTranslationActive();

  if (isExpectedState()) return true;

  return new Promise((resolve) => {
    let observer: MutationObserver | null = null;

    const timeoutId = window.setTimeout(() => {
      observer?.disconnect();
      resolve(isExpectedState());
    }, timeoutMs);

    observer = new MutationObserver(() => {
      if (isExpectedState()) {
        window.clearTimeout(timeoutId);
        observer?.disconnect();
        resolve(true);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  });
};

const ensureTranslateCombo = async (
  timeoutMs: number,
): Promise<HTMLSelectElement | null> => {
  const normalizedTimeout = Math.max(timeoutMs, MIN_COMBO_WAIT_MS);

  let combo = await waitForTranslateCombo(normalizedTimeout);
  if (combo) return combo;

  triggerGoogleTranslateInit();

  combo = await waitForTranslateCombo(
    Math.max(MIN_COMBO_WAIT_MS, Math.floor(normalizedTimeout / 2)),
  );
  return combo;
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
  timeoutMs: number = 1500,
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const currentTargetLanguage = getGoogleTranslateTargetLanguage();
  const normalizedCurrentTarget = toNormalizedGoogleLanguageCode(
    currentTargetLanguage,
  );
  const revertCookieToPreviousTarget = () =>
    restoreGoogleTranslateLanguageCookie(currentTargetLanguage);

  // Set cookie immediately so reload fallback applies target language deterministically.
  setGoogleTranslateLanguageCookie(languageCode);

  const combo = await ensureTranslateCombo(timeoutMs);

  if (!combo) {
    revertCookieToPreviousTarget();
    return false;
  }

  const resolvedCode = resolveLanguageForCombo(languageCode, combo);
  const normalizedResolvedCode = toNormalizedGoogleLanguageCode(resolvedCode);

  if (!normalizedResolvedCode) {
    revertCookieToPreviousTarget();
    return false;
  }

  setGoogleTranslateLanguageCookie(resolvedCode);

  const switchingBetweenNonDefaultLanguages =
    !!normalizedCurrentTarget &&
    !isDefaultGoogleLanguage(normalizedCurrentTarget) &&
    !isDefaultGoogleLanguage(normalizedResolvedCode) &&
    normalizedCurrentTarget.split('-')[0] !==
      normalizedResolvedCode.split('-')[0];

  // Existing translated-* classes cannot confirm non-default -> non-default switches.
  if (switchingBetweenNonDefaultLanguages) {
    revertCookieToPreviousTarget();
    return false;
  }

  combo.value = resolvedCode;
  combo.dispatchEvent(new Event('change', { bubbles: true }));

  // Verify translation state quickly so caller can fallback immediately if needed.
  const confirmed = await waitForDomTranslationState(
    !isDefaultGoogleLanguage(normalizedResolvedCode),
    Math.max(700, timeoutMs),
  );
  if (!confirmed) {
    revertCookieToPreviousTarget();
    return false;
  }

  return true;
};
