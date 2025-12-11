'use client';

import Script from 'next/script';
import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
    googleTranslateLoaded?: boolean;
  }
}

const GoogleTranslate = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if translation is already loaded
    if (window.google?.translate) {
      window.googleTranslateLoaded = true;
    }

    // Aggressively hide Google Translate banner on mount and on any DOM changes
    const hideTranslateBanner = () => {
      // Hide the banner frame
      const bannerFrames = document.querySelectorAll(
        '.goog-te-banner-frame, .skiptranslate iframe',
      );
      bannerFrames.forEach((frame) => {
        if (frame instanceof HTMLElement) {
          frame.style.setProperty('display', 'none', 'important');
          frame.style.setProperty('visibility', 'hidden', 'important');
        }
      });

      // Reset body top position
      document.body.style.top = '0';
      document.body.style.position = 'static';

      // Remove any translate-related classes from body
      document.body.classList.remove('translated-ltr', 'translated-rtl');
    };

    // Run immediately
    hideTranslateBanner();

    // Run periodically to catch any late additions
    const interval = setInterval(hideTranslateBanner, 100);

    // Observe DOM for any Google Translate injections
    const observer = new MutationObserver(hideTranslateBanner);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="hidden">
      <div
        id="google_translate_element"
        className="google-translate-container"
      />

      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            if (window.google && window.google.translate) {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false,
                  includedLanguages: 'en,en-GB,fr,sw,ar,pt,ha,am,zu,yo,ig,so,rw,mg,es,de,it,pl,nl,ru,sv,fi,zh-CN,hi,ja,ko,th,vi,id'
                },
                'google_translate_element'
              );
              
              // Mark as loaded
              window.googleTranslateLoaded = true;
              
              // Aggressively hide banner
              const hideGoogleBanner = function() {
                const frames = document.querySelectorAll('.goog-te-banner-frame, iframe.skiptranslate, .skiptranslate');
                frames.forEach(function(el) {
                  if (el && el.style) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                  }
                });
                document.body.style.top = '0';
                document.body.style.position = 'static';
              };
              
              // Run immediately and repeatedly
              hideGoogleBanner();
              setInterval(hideGoogleBanner, 100);
              
              // Enhanced translation for dynamic content
              setTimeout(function() {
                if (window.google && window.google.translate) {
                  const translateObserver = new MutationObserver(function(mutations) {
                    hideGoogleBanner();
                  });
                  
                  translateObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false
                  });
                }
              }, 500);
            }
          }
        `}
      </Script>

      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      <style jsx global>{`
        /* CRITICAL: Aggressively hide all Google Translate banner elements */
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        body > .skiptranslate,
        iframe.skiptranslate,
        iframe.goog-te-banner-frame,
        .goog-te-banner,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
          z-index: -9999 !important;
          pointer-events: none !important;
        }

        /* Force body positioning */
        body,
        body.translated-ltr,
        body.translated-rtl {
          top: 0 !important;
          position: static !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
        }

        /* Hide any iframe from Google Translate */
        iframe[src*='translate.google'],
        iframe[src*='translate.googleapis'] {
          display: none !important;
          visibility: hidden !important;
        }
        /* Customize the widget to look cleaner */
        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 0 !important; /* Hide text */
          color: transparent !important;
        }
        .goog-te-gadget .goog-te-combo {
          color: #374151; /* text-gray-700 */
          border: 1px solid #e5e7eb; /* border-gray-200 */
          border-radius: 0.375rem; /* rounded-md */
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem; /* text-sm */
          line-height: 1.25rem;
          outline: none;
          background-color: white;
          cursor: pointer;
          margin: 0 !important;
        }
        /* Hide the Google logo/branding text if possible */
        .goog-logo-link {
          display: none !important;
        }
        .goog-te-gadget span {
          display: none !important;
        }
        /* Fix for the iframe that Google injects */
        #goog-gt-tt {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleTranslate;
