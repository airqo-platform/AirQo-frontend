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

const GoogleTranslate = () => {
  useEffect(() => {
    const originalBodyStyles = {
      top: document.body.style.top,
      position: document.body.style.position,
      marginTop: document.body.style.marginTop,
      paddingTop: document.body.style.paddingTop,
    };
    let didAdjustBodyStyles = false;

    const hideTranslateArtifacts = () => {
      const elements = document.querySelectorAll(
        '.goog-te-banner-frame, .skiptranslate iframe, iframe.skiptranslate, iframe.goog-te-banner-frame, .goog-te-balloon-frame',
      );

      if (elements.length === 0) {
        return;
      }

      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('display', 'none', 'important');
          element.style.setProperty('visibility', 'hidden', 'important');
        }
      });

      if (!didAdjustBodyStyles) {
        document.body.style.top = '0';
        document.body.style.position = 'static';
        document.body.style.marginTop = '0';
        document.body.style.paddingTop = '0';
        didAdjustBodyStyles = true;
      }
    };

    let frameId: number | null = null;
    const scheduleHide = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        hideTranslateArtifacts();
        frameId = null;
      });
    };

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
      scheduleHide();
    };

    window.googleTranslateElementInit = initGoogleTranslate;

    if (window.google?.translate) {
      initGoogleTranslate();
    } else if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    scheduleHide();

    const observer = new MutationObserver(() => {
      scheduleHide();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const timeoutIds = [150, 500, 1200, 2500].map((delay) =>
      window.setTimeout(scheduleHide, delay),
    );

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
      observer.disconnect();
      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      document.removeEventListener('click', handleDocumentClick, true);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (didAdjustBodyStyles) {
        document.body.style.top = originalBodyStyles.top;
        document.body.style.position = originalBodyStyles.position;
        document.body.style.marginTop = originalBodyStyles.marginTop;
        document.body.style.paddingTop = originalBodyStyles.paddingTop;
      }
    };
  }, []);

  return (
    <div className="hidden notranslate" aria-hidden>
      <div
        id="google_translate_element"
        className="google-translate-container"
      />
    </div>
  );
};

export default GoogleTranslate;
