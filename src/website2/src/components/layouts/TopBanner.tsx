'use client';

import React, { useEffect, useState } from 'react';

import LanguageModal from '@/components/dialogs/LanguageModal';
import GoogleTranslate from '@/components/GoogleTranslate';
import { Language, languages } from '@/utils/languages';

const TopBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0],
  ); // Default to English

  useEffect(() => {
    // Check for existing google translate cookie
    const getCookie = (name: string): string | undefined => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const googtrans = getCookie('googtrans');
    if (googtrans) {
      const langCode = googtrans.split('/').pop();
      const foundLang = languages.find((l) => l.code === langCode);
      if (foundLang) {
        setSelectedLanguage(foundLang);
      }
    }
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    setIsModalOpen(false);

    // Set the google translate cookie with the format /auto/target_lang
    const cookieValue = `/auto/${lang.code}`;
    const domain = window.location.hostname.replace(/^www\./, '');

    // Set cookie for both domain and without domain (for localhost)
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}; max-age=31536000`;
    document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;

    // Reload the page to apply translation
    window.location.reload();
  };

  return (
    <>
      <GoogleTranslate />
      <div className="w-full bg-blue-50 border-b border-blue-100">
        <div className="container mx-auto max-w-5xl px-2 flex justify-end items-center py-1">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-1.5 text-sm"
            aria-label="Select language"
          >
            <span
              className="text-xl"
              role="img"
              aria-label={selectedLanguage.country}
            >
              {selectedLanguage.flag}
            </span>
            <span className="font-medium">{selectedLanguage.name}</span>
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
