'use client';

import React, { useEffect, useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import LanguageModal from '@/components/dialogs/LanguageModal';
import LanguageFlag from '@/components/LanguageFlag';
import {
  applyGoogleTranslateLanguage,
  getGoogleTranslateTargetLanguage,
  getPersistedLanguageCode,
  setPersistedLanguageCode,
} from '@/utils/googleTranslate';
import { Language, languages } from '@/utils/languages';

const DEFAULT_LANGUAGE =
  languages.find((lang) => lang.code === 'en-GB') || languages[0];

const TopBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyingLanguage, setIsApplyingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const targetLanguage = getGoogleTranslateTargetLanguage();
    const persistedLanguage = getPersistedLanguageCode();

    let resolvedLanguage: Language | undefined;

    // Prefer cookie when actively translated to a non-English language.
    if (targetLanguage && targetLanguage !== 'en') {
      resolvedLanguage =
        languages.find((lang) => lang.code === targetLanguage) ||
        languages.find(
          (lang) => lang.code.split('-')[0] === targetLanguage.split('-')[0],
        );
    }

    if (!resolvedLanguage && persistedLanguage) {
      resolvedLanguage = languages.find(
        (lang) => lang.code === persistedLanguage,
      );
    }

    if (resolvedLanguage) {
      setSelectedLanguage(resolvedLanguage);
    }
  }, []);

  const handleLanguageSelect = async (language: Language) => {
    if (isApplyingLanguage) return;

    setSelectedLanguage(language);
    setPersistedLanguageCode(language.code);
    setIsModalOpen(false);

    const currentTargetLanguage = getGoogleTranslateTargetLanguage();
    const sameLanguage =
      currentTargetLanguage === language.code ||
      currentTargetLanguage === language.code.split('-')[0];

    if (sameLanguage) return;

    setIsApplyingLanguage(true);

    try {
      const applied = await applyGoogleTranslateLanguage(language.code, 2500);

      // One light retry for cases where Google script is still initializing
      if (!applied) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const retryApplied = await applyGoogleTranslateLanguage(
          language.code,
          2000,
        );

        // Last resort fallback to hard reload for deterministic application.
        if (!retryApplied) {
          window.location.reload();
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
