'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import LanguageModal from '@/components/dialogs/LanguageModal';
import LanguageFlag from '@/components/LanguageFlag';
import {
  applyGoogleTranslateLanguage,
  clearGoogleTranslateLanguageCookie,
  getGoogleTranslateTargetLanguage,
  getPersistedLanguageCode,
  isGoogleTranslateScriptBlocked,
  normalizeGoogleLanguageCode,
  setGoogleTranslateLanguageCookie,
  setPersistedLanguageCode,
} from '@/utils/googleTranslate';
import { Language, languages } from '@/utils/languages';

const DEFAULT_LANGUAGE =
  languages.find((lang) => lang.code === 'en-GB') || languages[0];
const DEFAULT_GOOGLE_LANGUAGE = 'en';

const handleFailedLanguageApply = (
  languageCode: string,
  shouldReload: boolean,
): { blockedByScript: boolean } => {
  const scriptBlocked = isGoogleTranslateScriptBlocked();
  if (scriptBlocked) {
    console.warn(
      'Google Translate is blocked by browser settings or an extension.',
    );
  }

  // Background retries must not leave stale translation cookies active.
  if (!shouldReload) {
    clearGoogleTranslateLanguageCookie();
    return { blockedByScript: scriptBlocked };
  }

  if (scriptBlocked) {
    clearGoogleTranslateLanguageCookie();
    return { blockedByScript: true };
  }

  setGoogleTranslateLanguageCookie(languageCode);
  window.location.reload();
  return { blockedByScript: false };
};

const findLanguageByCode = (languageCode: string): Language | undefined => {
  const rawCode = languageCode.trim().toLowerCase();
  if (!rawCode) return undefined;

  const normalizedCode = normalizeGoogleLanguageCode(languageCode)
    .trim()
    .toLowerCase();
  const primaryRaw = rawCode.split('-')[0];
  const primaryNormalized = normalizedCode.split('-')[0];

  return (
    languages.find((lang) => lang.code.toLowerCase() === rawCode) ||
    languages.find(
      (lang) =>
        normalizeGoogleLanguageCode(lang.code).trim().toLowerCase() ===
        normalizedCode,
    ) ||
    languages.find(
      (lang) => lang.code.toLowerCase().split('-')[0] === primaryRaw,
    ) ||
    languages.find(
      (lang) =>
        normalizeGoogleLanguageCode(lang.code)
          .trim()
          .toLowerCase()
          .split('-')[0] === primaryNormalized,
    )
  );
};

const TopBanner = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyingLanguage, setIsApplyingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const targetLanguage = getGoogleTranslateTargetLanguage();
    const persistedLanguage = getPersistedLanguageCode();

    let resolvedLanguage: Language | undefined;

    // Prefer cookie when actively translated to a non-English language.
    if (
      targetLanguage &&
      normalizeGoogleLanguageCode(targetLanguage).toLowerCase() !== 'en'
    ) {
      resolvedLanguage = findLanguageByCode(targetLanguage);
    }

    if (!resolvedLanguage && persistedLanguage) {
      resolvedLanguage = findLanguageByCode(persistedLanguage);
    }

    if (resolvedLanguage) {
      setSelectedLanguage(resolvedLanguage);
    }
  }, []);

  useEffect(() => {
    if (isApplyingLanguage || isGoogleTranslateScriptBlocked()) return;

    const targetLanguage = getGoogleTranslateTargetLanguage();
    const requestedLanguage =
      targetLanguage ||
      normalizeGoogleLanguageCode(selectedLanguage.code).toLowerCase();

    const normalizedRequested =
      normalizeGoogleLanguageCode(requestedLanguage).toLowerCase();
    const isDefaultLanguage =
      normalizedRequested === DEFAULT_GOOGLE_LANGUAGE ||
      normalizedRequested.split('-')[0] === DEFAULT_GOOGLE_LANGUAGE;

    if (isDefaultLanguage) return;

    const retryController = new AbortController();
    const retryDelays = [120, 800, 1800];

    const waitForDelay = async (delay: number, signal: AbortSignal) =>
      new Promise<boolean>((resolve) => {
        if (signal.aborted) {
          resolve(false);
          return;
        }

        const timeoutId = window.setTimeout(() => {
          signal.removeEventListener('abort', handleAbort);
          resolve(true);
        }, delay);

        const handleAbort = () => {
          window.clearTimeout(timeoutId);
          resolve(false);
        };

        signal.addEventListener('abort', handleAbort, { once: true });
      });

    void (async () => {
      for (const delay of retryDelays) {
        const shouldContinue = await waitForDelay(
          delay,
          retryController.signal,
        );
        if (!shouldContinue) return;

        const applied = await applyGoogleTranslateLanguage(
          requestedLanguage,
          1800,
          {
            signal: retryController.signal,
            requireFreshContentSignal: true,
          },
        );

        if (retryController.signal.aborted) return;
        if (applied) return;
      }

      handleFailedLanguageApply(requestedLanguage, false);
    })();

    return () => {
      retryController.abort();
    };
  }, [isApplyingLanguage, pathname, selectedLanguage.code]);

  const handleLanguageSelect = async (language: Language) => {
    if (isApplyingLanguage) return;

    const previousLanguage = selectedLanguage;
    setSelectedLanguage(language);
    setPersistedLanguageCode(language.code);
    setIsModalOpen(false);

    const currentTargetLanguage = getGoogleTranslateTargetLanguage();
    const normalizedCurrent = currentTargetLanguage
      ? normalizeGoogleLanguageCode(currentTargetLanguage).toLowerCase()
      : null;
    const normalizedRequested = normalizeGoogleLanguageCode(
      language.code,
    ).toLowerCase();
    const sameLanguage =
      normalizedCurrent === normalizedRequested ||
      normalizedCurrent === normalizedRequested.split('-')[0];

    if (sameLanguage) return;

    setIsApplyingLanguage(true);

    try {
      const applied = await applyGoogleTranslateLanguage(language.code, 1500);

      // Fast deterministic fallback when combo is unavailable.
      if (!applied) {
        const failure = handleFailedLanguageApply(language.code, true);
        if (failure.blockedByScript) {
          setSelectedLanguage(previousLanguage);
          setPersistedLanguageCode(previousLanguage.code);
        }
      }
    } finally {
      setIsApplyingLanguage(false);
    }
  };

  return (
    <>
      <div className="w-full bg-blue-50 border-b border-blue-100 notranslate">
        <div className="container mx-auto max-w-5xl px-2 flex justify-between items-center py-1">
          <div className="flex items-center space-x-4">
            <a
              href="mailto:info@airqo.net"
              className="hidden md:block text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors"
              aria-label="Contact us via email"
            >
              (info@airqo.net)
            </a>
            <a
              href="https://www.facebook.com/AirQo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
              aria-label="Follow us on Facebook"
            >
              <FaFacebookF size={14} />
            </a>
            <a
              href="https://x.com/AirQoProject"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
              aria-label="Follow us on Twitter"
            >
              <FaXTwitter size={14} />
            </a>
            <a
              href="https://www.linkedin.com/company/airqo/mycompany/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
              aria-label="Follow us on LinkedIn"
            >
              <FaLinkedinIn size={14} />
            </a>
            <a
              href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
              aria-label="Subscribe to our YouTube channel"
            >
              <FaYoutube size={14} />
            </a>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isApplyingLanguage}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-1.5 text-sm disabled:opacity-70 disabled:cursor-wait"
            aria-label="Select language"
          >
            <LanguageFlag
              flag={selectedLanguage.flag}
              country={selectedLanguage.country}
              languageCode={selectedLanguage.code}
              width={20}
              height={16}
              wrapperClassName="flex items-center justify-center w-5 h-4 overflow-hidden rounded border border-gray-200"
              fallbackTextClassName="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 font-semibold text-[9px] rounded border border-blue-200"
            />
            <span className="font-medium">
              {isApplyingLanguage ? 'Applying...' : selectedLanguage.name}
            </span>
          </button>
        </div>
      </div>

      <LanguageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLanguage={handleLanguageSelect}
      />
    </>
  );
};

export default TopBanner;
