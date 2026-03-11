'use client';

const GOOGTRANS_COOKIE_NAME = 'googtrans';
const GOOGLE_TRANSLATE_COMBO_SELECTOR = '.goog-te-combo';
const GOOGLE_TRANSLATE_CONTENT_ROOT_SELECTORS = [
  'main',
  '[role="main"]',
  '#__next',
  '[data-nextjs-scroll-focus-boundary]',
];
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

export const clearGoogleTranslateLanguageCookie = () => {
  clearGoogTransCookie();
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
  signal?: AbortSignal,
): Promise<HTMLSelectElement | null> => {
  if (typeof document === 'undefined') return null;
  if (signal?.aborted) return null;

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
    let didResolve = false;

    const finalize = (combo: HTMLSelectElement | null) => {
      if (didResolve) return;
      didResolve = true;
      observer?.disconnect();
      signal?.removeEventListener('abort', handleAbort);
      resolve(combo);
    };

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      finalize(null);
    };

    const timeoutId = window.setTimeout(() => {
      finalize(null);
    }, timeoutMs);

    observer = new MutationObserver(() => {
      const combo = document.querySelector(
        GOOGLE_TRANSLATE_COMBO_SELECTOR,
      ) as HTMLSelectElement | null;

      if (combo) {
        cachedTranslateCombo = combo;
        window.clearTimeout(timeoutId);
        finalize(combo);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    signal?.addEventListener('abort', handleAbort, { once: true });
  });
};

const isDomTranslationActive = (): boolean => {
  if (typeof document === 'undefined') return false;

  return (
    document.body.classList.contains('translated-ltr') ||
    document.body.classList.contains('translated-rtl')
  );
};

const getGoogleTranslateContentRoot = (): HTMLElement => {
  for (const selector of GOOGLE_TRANSLATE_CONTENT_ROOT_SELECTORS) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) return element;
  }

  return document.body;
};

const getContentSignature = (root: HTMLElement): string => {
  const textSample = (root.textContent || '')
    .replace(/\s+/g, ' ')
    .slice(0, 300);
  return `${root.childElementCount}:${textSample}`;
};

type WaitForDomTranslationOptions = {
  signal?: AbortSignal;
  requireFreshContentSignal?: boolean;
};

const waitForDomTranslationState = async (
  shouldBeActive: boolean,
  timeoutMs: number,
  options: WaitForDomTranslationOptions = {},
): Promise<boolean> => {
  if (typeof document === 'undefined') return false;
  if (options.signal?.aborted) return false;

  const root = getGoogleTranslateContentRoot();
  const requireFreshContentSignal =
    shouldBeActive && !!options.requireFreshContentSignal;
  const initialSignature = requireFreshContentSignal
    ? getContentSignature(root)
    : null;
  let sawFreshContentMutation = false;

  const hasExpectedTranslationState = () =>
    shouldBeActive ? isDomTranslationActive() : !isDomTranslationActive();

  const hasFreshContentSignal = () =>
    !requireFreshContentSignal ||
    sawFreshContentMutation ||
    getContentSignature(root) !== initialSignature;

  const isExpectedState = () =>
    hasExpectedTranslationState() && hasFreshContentSignal();

  if (isExpectedState()) return true;

  return new Promise((resolve) => {
    let observer: MutationObserver | null = null;
    let didResolve = false;

    const finalize = (result: boolean) => {
      if (didResolve) return;
      didResolve = true;
      observer?.disconnect();
      options.signal?.removeEventListener('abort', handleAbort);
      resolve(result);
    };

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      finalize(false);
    };

    const timeoutId = window.setTimeout(() => {
      finalize(isExpectedState());
    }, timeoutMs);

    observer = new MutationObserver((mutations) => {
      if (requireFreshContentSignal) {
        sawFreshContentMutation = mutations.some(
          (mutation) =>
            mutation.type !== 'attributes' ||
            mutation.target !== document.body ||
            mutation.attributeName !== 'class',
        );
      }

      if (isExpectedState()) {
        window.clearTimeout(timeoutId);
        finalize(true);
      }
    });

    if (root === document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        childList: requireFreshContentSignal,
        characterData: requireFreshContentSignal,
        subtree: requireFreshContentSignal,
      });
    } else {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });

      if (requireFreshContentSignal) {
        observer.observe(root, {
          attributes: true,
          attributeFilter: ['class', 'lang'],
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    }

    options.signal?.addEventListener('abort', handleAbort, { once: true });
  });
};

const ensureTranslateCombo = async (
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<HTMLSelectElement | null> => {
  if (signal?.aborted) return null;

  const normalizedTimeout = Math.max(timeoutMs, MIN_COMBO_WAIT_MS);

  let combo = await waitForTranslateCombo(normalizedTimeout, signal);
  if (combo) return combo;
  if (signal?.aborted) return null;

  triggerGoogleTranslateInit();

  combo = await waitForTranslateCombo(
    Math.max(MIN_COMBO_WAIT_MS, Math.floor(normalizedTimeout / 2)),
    signal,
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
  options: {
    signal?: AbortSignal;
    requireFreshContentSignal?: boolean;
  } = {},
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (options.signal?.aborted) return false;

  const currentTargetLanguage = getGoogleTranslateTargetLanguage();
  const normalizedCurrentTarget = toNormalizedGoogleLanguageCode(
    currentTargetLanguage,
  );
  const revertCookieToPreviousTarget = () =>
    restoreGoogleTranslateLanguageCookie(currentTargetLanguage);
  const abortAndRevert = () => {
    revertCookieToPreviousTarget();
    return false;
  };

  // Set cookie immediately so reload fallback applies target language deterministically.
  if (options.signal?.aborted) return false;
  setGoogleTranslateLanguageCookie(languageCode);
  if (options.signal?.aborted) return abortAndRevert();

  const combo = await ensureTranslateCombo(timeoutMs, options.signal);

  if (!combo) {
    revertCookieToPreviousTarget();
    return false;
  }
  if (options.signal?.aborted) return abortAndRevert();

  const resolvedCode = resolveLanguageForCombo(languageCode, combo);
  const normalizedResolvedCode = toNormalizedGoogleLanguageCode(resolvedCode);

  if (!normalizedResolvedCode) {
    revertCookieToPreviousTarget();
    return false;
  }

  setGoogleTranslateLanguageCookie(resolvedCode);
  if (options.signal?.aborted) return abortAndRevert();

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
    {
      signal: options.signal,
      requireFreshContentSignal: options.requireFreshContentSignal,
    },
  );
  if (options.signal?.aborted) return abortAndRevert();
  if (!confirmed) {
    revertCookieToPreviousTarget();
    return false;
  }

  return true;
};
