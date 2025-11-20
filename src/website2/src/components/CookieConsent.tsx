'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import CustomButton from '@/components/ui/CustomButton';
import {
  acceptAllCookies,
  acceptNecessaryCookies,
  hasAnalyticsConsent,
  setConsentPreferences,
  shouldShowConsentBanner,
} from '@/utils/cookieConsent';

/**
 * GDPR-compliant Cookie Consent Banner
 * Displays at bottom of screen, allows granular consent choices
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if banner should be shown
    const shouldShow = shouldShowConsentBanner();
    setShowBanner(shouldShow);
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
    // Trigger analytics initialization if needed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookieConsentChanged'));
    }
  };

  const handleAcceptNecessary = () => {
    acceptNecessaryCookies();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    setConsentPreferences(preferences);
    setShowBanner(false);
    // Trigger analytics initialization if needed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookieConsentChanged'));
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        role="dialog"
        aria-label="Cookie consent banner"
        aria-describedby="cookie-consent-description"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!showDetails ? (
            // Simple Banner View
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1 pr-4">
                <p
                  id="cookie-consent-description"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  This website uses cookies to enhance your browsing experience,
                  serve personalized content, and analyze our traffic. By
                  selecting &quot;Accept All&quot;, you consent to our use of
                  cookies.{' '}
                  <Link
                    href="/legal/privacy-policy"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Learn more
                  </Link>
                </p>
              </div>

              <div className="flex flex-row items-center gap-3 flex-shrink-0">
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 text-sm font-medium whitespace-nowrap"
                >
                  Customize
                </Button>
                <Button
                  onClick={handleAcceptNecessary}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 text-sm font-medium whitespace-nowrap"
                >
                  Necessary Only
                </Button>
                <CustomButton
                  onClick={handleAcceptAll}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 whitespace-nowrap"
                >
                  Accept All
                </CustomButton>
              </div>
            </div>
          ) : (
            // Detailed Preferences View
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Cookie Preferences
                </h3>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {/* Necessary Cookies */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-base">
                      Necessary Cookies
                    </h4>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Essential for the website to function properly. These cannot
                    be disabled.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-base">
                      Analytics Cookies
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            analytics: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Help us understand how visitors interact with our website
                    (Google Analytics).
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-base">
                      Marketing Cookies
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            marketing: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Used to deliver personalized content and advertisements.
                  </p>
                </div>
              </div>

              <div className="flex flex-row gap-3 pt-4 border-t border-gray-200 justify-start">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                >
                  Back
                </Button>
                <CustomButton
                  onClick={handleSavePreferences}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
                >
                  Save Preferences
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to check if analytics consent is granted
 * Components can use this to conditionally load analytics scripts
 */
export function useAnalyticsConsent() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent
    setHasConsent(hasAnalyticsConsent());

    // Listen for consent changes
    const handleConsentChange = () => {
      setHasConsent(hasAnalyticsConsent());
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  return hasConsent;
}
