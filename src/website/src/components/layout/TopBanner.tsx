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
} from '@/lib/utils/googleTranslate';
import { Language, languages } from '@/lib/utils/languages';

const DEFAULT_LANGUAGE =
  languages.find((lang) => lang.code === 'en-GB') || languages[0];
const DEFAULT_GOOGLE_LANGUAGE = 'en';

const resolveSelectedLanguage = (): Language => {
  const activeLanguage = getGoogleTranslateTargetLanguage();
  const persistedLanguage = getPersistedLanguageCode();

  const activeResolved =
    activeLanguage &&
    normalizeGoogleLanguageCode(activeLanguage).trim().toLowerCase() !==
      DEFAULT_GOOGLE_LANGUAGE
      ? findLanguageByCode(activeLanguage)
      : undefined;

  const persistedResolved = persistedLanguage
    ? findLanguageByCode(persistedLanguage)
    : undefined;

  return activeResolved || persistedResolved || DEFAULT_LANGUAGE;
};

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

const TopBanner = ({ insideShell = false }: { insideShell?: boolean }) => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyingLanguage, setIsApplyingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const syncSelectedLanguage = () => {
      const resolvedLanguage = resolveSelectedLanguage();

      setSelectedLanguage((current) =>
        current.code === resolvedLanguage.code ? current : resolvedLanguage,
      );
    };

    syncSelectedLanguage();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncSelectedLanguage();
      }
    };

    window.addEventListener('focus', syncSelectedLanguage);
    window.addEventListener('pageshow', syncSelectedLanguage);
    window.addEventListener('storage', syncSelectedLanguage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncSelectedLanguage);
      window.removeEventListener('pageshow', syncSelectedLanguage);
      window.removeEventListener('storage', syncSelectedLanguage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  useEffect(() => {
    if (isApplyingLanguage || isGoogleTranslateScriptBlocked()) return;
    const normalizedSelectedLanguage = normalizeGoogleLanguageCode(
      selectedLanguage.code,
    )
      .trim()
      .toLowerCase();

    const selectedIsDefault =
      normalizedSelectedLanguage === DEFAULT_GOOGLE_LANGUAGE ||
      normalizedSelectedLanguage.split('-')[0] === DEFAULT_GOOGLE_LANGUAGE;

    if (selectedIsDefault) return;

    const syncTranslation = window.setTimeout(() => {
      void applyGoogleTranslateLanguage(selectedLanguage.code, 1200, {
        requireFreshContentSignal: true,
      });
    }, 0);

    return () => {
      window.clearTimeout(syncTranslation);
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

    if (sameLanguage) {
      return;
    }

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
      } else {
        setSelectedLanguage(language);
      }
    } finally {
      setIsApplyingLanguage(false);
    }
  };

  return (
    <>
      <div
        className={`w-full border-b border-line bg-surface-muted notranslate ${
          insideShell ? 'rounded-t-md' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-nowrap items-center gap-2 px-4 py-1 sm:px-6 lg:px-8">
          <div className="hidden flex-none items-center space-x-1 sm:flex">
            <a
              href="mailto:info@airqo.net"
              className="hidden px-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 md:block"
              aria-label="Email AirQo at info@airqo.net"
            >
              (info@airqo.net)
            </a>

            {[
              {
                href: 'https://www.facebook.com/AirQo',
                label: 'Follow us on Facebook',
                icon: FaFacebookF,
              },
              {
                href: 'https://x.com/AirQoProject',
                label: 'Follow us on X',
                icon: FaXTwitter,
              },
              {
                href: 'https://www.linkedin.com/company/airqo/mycompany/',
                label: 'Follow us on LinkedIn',
                icon: FaLinkedinIn,
              },
              {
                href: 'https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ',
                label: 'Subscribe to our YouTube channel',
                icon: FaYoutube,
              },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label={label}
              >
                <Icon size={14} aria-hidden="true" />
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isApplyingLanguage}
            className="ml-auto flex flex-none items-center space-x-2 rounded-md px-3 py-1.5 text-sm text-gray-700 transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            aria-label={`Select language, current: ${selectedLanguage.name}`}
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
            <span className="max-w-[120px] truncate font-medium">
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
