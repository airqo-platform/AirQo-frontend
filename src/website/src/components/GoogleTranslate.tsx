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
    googleTranslateScriptBlocked?: boolean;
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
const GOOGLE_TRANSLATE_SCRIPT_PROXY_SRC =
  '/api/translate/element?cb=googleTranslateElementInit';
const GOOGLE_TRANSLATE_BANNER_SELECTORS = [
  '.goog-te-banner-frame',
  '.goog-te-banner-frame.skiptranslate',
  'iframe.goog-te-banner-frame',
  '.goog-te-banner',
  '#goog-gt-tt',
  '.goog-te-balloon-frame',
  '.VIpgJd-ZVi9od-ORHb-OEVmcd',
  '.VIpgJd-ZVi9od-ORHb',
  '.VIpgJd-ZVi9od-xl07Ob-OEVmcd',
  '.skiptranslate > iframe',
];

const GoogleTranslate = () => {
  useEffect(() => {
    const keepElementAliveButInvisible = (element: HTMLElement) => {
      // Keep node rendered (not display:none) so translate runtime remains active.
      element.style.setProperty('display', 'block', 'important');
      element.style.setProperty('visibility', 'hidden', 'important');
      element.style.setProperty('opacity', '0', 'important');
      element.style.setProperty('height', '1px', 'important');
      element.style.setProperty('min-height', '0', 'important');
      element.style.setProperty('width', '1px', 'important');
      element.style.setProperty('max-width', '1px', 'important');
      element.style.setProperty('overflow', 'hidden', 'important');
      element.style.setProperty('top', '-10000px', 'important');
      element.style.setProperty('left', '-10000px', 'important');
      element.style.setProperty('position', 'fixed', 'important');
      element.style.setProperty('pointer-events', 'none', 'important');
      element.style.setProperty('z-index', '-2147483648', 'important');
    };

    const hideGoogleTranslateBanner = () => {
      const candidateElements = new Set<HTMLElement>();

      GOOGLE_TRANSLATE_BANNER_SELECTORS.forEach((selector) => {
        document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          candidateElements.add(element);
        });
      });

      document
        .querySelectorAll<HTMLElement>('body > .skiptranslate')
        .forEach((wrapper) => {
          if (
            wrapper.querySelector(
              'iframe.goog-te-banner-frame, iframe[src*="translate.google"], iframe[src*="translate.googleapis"], .VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-ORHb',
            )
          ) {
            candidateElements.add(wrapper);
          }
        });

      candidateElements.forEach((element) => {
        keepElementAliveButInvisible(element);
        element.setAttribute('aria-hidden', 'true');
      });

      document.body.style.setProperty('top', '0px', 'important');
      document.body.style.setProperty('margin-top', '0px', 'important');
      document.body.style.setProperty('padding-top', '0px', 'important');
      document.body.style.setProperty('position', 'static', 'important');
    };

    hideGoogleTranslateBanner();

    let bannerRaf = 0;
    const bannerObserver = new MutationObserver(() => {
      if (bannerRaf) return;
      bannerRaf = window.requestAnimationFrame(() => {
        hideGoogleTranslateBanner();
        bannerRaf = 0;
      });
    });

    bannerObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    const addPreconnect = (href: string) => {
      const existing = document.querySelector(
        `link[rel="preconnect"][href="${href}"]`,
      );
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    addPreconnect('https://translate.google.com');
    addPreconnect('https://translate.googleapis.com');
    addPreconnect('https://translate.gstatic.com');

    const initGoogleTranslate = () => {
      if (!window.google?.translate) return;
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (typeof TranslateElement !== 'function') return;

      if (
        window.googleTranslateLoaded &&
        document.querySelector('.goog-te-combo')
      ) {
        return;
      }

      if (!document.getElementById('google_translate_element')) return;

      const translateElementConfig: {
        pageLanguage: string;
        autoDisplay: boolean;
        includedLanguages: string;
        layout?: unknown;
      } = {
        pageLanguage: 'en',
        autoDisplay: false,
        includedLanguages: INCLUDED_LANGUAGES,
      };

      if (TranslateElement.InlineLayout?.SIMPLE) {
        translateElementConfig.layout = TranslateElement.InlineLayout.SIMPLE;
      }

      try {
        new TranslateElement(
          translateElementConfig,
          'google_translate_element',
        );
        window.googleTranslateLoaded = true;
        hideGoogleTranslateBanner();
      } catch {
        window.googleTranslateLoaded = false;
      }
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
          script.fetchPriority = 'high';
          script.addEventListener('load', () => {
            window.googleTranslateScriptBlocked = false;
            script.setAttribute('data-gt-ready', 'true');
            initGoogleTranslate();
          });
          script.addEventListener('error', () => {
            if (isFallback) {
              window.googleTranslateScriptBlocked = true;
              return;
            }

            script.remove();
            if (sourceUrl === GOOGLE_TRANSLATE_SCRIPT_SRC) {
              loadScript(GOOGLE_TRANSLATE_SCRIPT_FALLBACK_SRC);
              return;
            }

            loadScript(GOOGLE_TRANSLATE_SCRIPT_PROXY_SRC, true);
          });
          document.head.appendChild(script);
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
      bannerObserver.disconnect();
      if (bannerRaf) {
        window.cancelAnimationFrame(bannerRaf);
      }
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
