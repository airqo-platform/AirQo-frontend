'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import LanguageModal from '@/components/dialogs/LanguageModal';
import { getFlagUrl, Language, languages } from '@/utils/languages';

const TopBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages.find((l) => l.code === 'en-GB') || languages[0],
  ); // Default to English UK

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
      if (langCode) {
        const foundLang = languages.find((l) => l.code === langCode);
        if (foundLang) {
          setSelectedLanguage(foundLang);
        }
      }
    }
  }, []); // Empty dependency array - only run once on mount

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
      <div className="w-full bg-blue-50 border-b border-blue-100">
        <div className="container mx-auto max-w-5xl px-2 flex justify-between items-center py-1">
          <div className="flex items-center space-x-4">
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
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-1.5 text-sm"
            aria-label="Select language"
          >
            <span
              className="flex items-center justify-center w-5 h-4 overflow-hidden rounded border border-gray-200"
              role="img"
              aria-label={selectedLanguage.country}
            >
              <Image
                src={getFlagUrl(selectedLanguage.flag)}
                alt={`${selectedLanguage.country} flag`}
                width={20}
                height={16}
                className="object-cover"
                unoptimized
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 font-semibold text-[9px] rounded border border-blue-200">${selectedLanguage.code.split('-')[0].toUpperCase()}</span>`;
                  }
                }}
              />
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
