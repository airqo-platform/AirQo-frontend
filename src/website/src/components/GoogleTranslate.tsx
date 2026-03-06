'use client';

import React, { useEffect } from 'react';

import {
  isGoogleTranslationActive,
  normalizeGoogleLanguageCode,
} from '@/utils/googleTranslate';
import { languages } from '@/utils/languages';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    googleTranslateLoaded?: boolean;
  }
}

const INCLUDED_LANGUAGES = Array.from(
  new Set(languages.map((lang) => normalizeGoogleLanguageCode(lang.code))),
).join(',');

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';
const GOOGLE_TRANSLATE_SCRIPT_SRC =
  'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
const GOOGLE_TRANSLATE_SCRIPT_FALLBACK_SRC =
  'https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit';

const GoogleTranslate = () => {
  useEffect(() => {
    const initGoogleTranslate = () => {
      if (!window.google?.translate) return;
      if (
        window.googleTranslateLoaded &&
        document.querySelector('.goog-te-combo')
      ) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          includedLanguages: INCLUDED_LANGUAGES,
        },
        'google_translate_element',
      );

      window.googleTranslateLoaded = true;
    };

    window.googleTranslateElementInit = initGoogleTranslate;

    if (window.google?.translate) {
      initGoogleTranslate();
    } else {
      const existingScript = document.getElementById(
        GOOGLE_TRANSLATE_SCRIPT_ID,
      ) as HTMLScriptElement | null;

      if (!existingScript) {
        const loadScript = (sourceUrl: string, isFallback = false) => {
          const script = document.createElement('script');
          script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
          script.src = sourceUrl;
          script.async = true;
          script.defer = true;
          script.fetchPriority = 'high';
          script.addEventListener('load', () => {
            script.setAttribute('data-gt-ready', 'true');
            initGoogleTranslate();
          });
          script.addEventListener('error', () => {
            if (isFallback) return;

            script.remove();
            loadScript(GOOGLE_TRANSLATE_SCRIPT_FALLBACK_SRC, true);
          });
          document.body.appendChild(script);
        };

        loadScript(GOOGLE_TRANSLATE_SCRIPT_SRC);
      } else if (existingScript.getAttribute('data-gt-ready') === 'true') {
        initGoogleTranslate();
      } else {
        const onLoad = () => {
          existingScript.setAttribute('data-gt-ready', 'true');
          initGoogleTranslate();
          existingScript.removeEventListener('load', onLoad);
        };
        existingScript.addEventListener('load', onLoad);
      }
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (!isGoogleTranslationActive()) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');

      if (!anchor || anchor.target === '_blank') return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      let destinationUrl: URL;
      try {
        destinationUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (destinationUrl.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      window.location.assign(destinationUrl.href);
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);

  return (
    <div className="google-translate-host notranslate" aria-hidden="true">
      <div
        id="google_translate_element"
        className="google-translate-container"
      />
    </div>
  );
};

export default GoogleTranslate;
