/**
 * Cookie Consent Management Utility
 * Handles GDPR-compliant cookie consent and user preferences
 */

export type ConsentType = 'necessary' | 'analytics' | 'marketing';

export interface ConsentPreferences {
  necessary: boolean; // Always true - required for site functionality
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_KEY = 'airqo_cookie_consent';
const CONSENT_BANNER_DISMISSED_KEY = 'airqo_consent_banner_dismissed';

/**
 * Get current consent preferences from localStorage
 */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const preferences = JSON.parse(stored) as ConsentPreferences;
    // Validate structure
    if (
      typeof preferences.necessary === 'boolean' &&
      typeof preferences.analytics === 'boolean' &&
      typeof preferences.marketing === 'boolean' &&
      typeof preferences.timestamp === 'number'
    ) {
      return preferences;
    }
    return null;
  } catch (error) {
    console.error('Error reading consent preferences:', error);
    return null;
  }
}

/**
 * Save consent preferences to localStorage
 */
export function setConsentPreferences(
  preferences: Omit<ConsentPreferences, 'timestamp'>,
): void {
  if (typeof window === 'undefined') return;

  try {
    const fullPreferences: ConsentPreferences = {
      ...preferences,
      necessary: true, // Always true
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullPreferences));
  } catch (error) {
    console.error('Error saving consent preferences:', error);
  }
}

/**
 * Check if user has made a consent choice
 */
export function hasConsent(): boolean {
  return getConsentPreferences() !== null;
}

/**
 * Check if analytics consent is granted
 */
export function hasAnalyticsConsent(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.analytics ?? false;
}

/**
 * Check if marketing consent is granted
 */
export function hasMarketingConsent(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.marketing ?? false;
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  setConsentPreferences({
    necessary: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Accept only necessary cookies
 */
export function acceptNecessaryCookies(): void {
  setConsentPreferences({
    necessary: true,
    analytics: false,
    marketing: false,
  });
}

/**
 * Clear all consent preferences
 */
export function clearConsentPreferences(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(CONSENT_BANNER_DISMISSED_KEY);
}

/**
 * Check if consent banner should be shown
 * Returns false if user has already made a choice or dismissed banner
 */
export function shouldShowConsentBanner(): boolean {
  if (typeof window === 'undefined') return false;

  // Don't show if user has already made a choice
  if (hasConsent()) return false;

  // Check if banner was dismissed (but not acted upon)
  try {
    const dismissed = localStorage.getItem(CONSENT_BANNER_DISMISSED_KEY);
    if (!dismissed) return true;

    // Check if dismissal has expired
    const dismissInfo = JSON.parse(dismissed);
    const now = Date.now();
    if (now > dismissInfo.expiresAt) {
      localStorage.removeItem(CONSENT_BANNER_DISMISSED_KEY);
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Mark consent banner as dismissed (without accepting)
 * Note: Banner will show again after 7 days if no action taken
 */
export function dismissConsentBanner(): void {
  if (typeof window === 'undefined') return;

  try {
    const dismissInfo = {
      timestamp: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    localStorage.setItem(
      CONSENT_BANNER_DISMISSED_KEY,
      JSON.stringify(dismissInfo),
    );
  } catch (error) {
    console.error('Error dismissing consent banner:', error);
  }
}

/**
 * Get a simple cookie value (for non-consent cookies)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)',
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Set a simple cookie (for non-consent cookies)
 */
export function setCookie(
  name: string,
  value: string,
  days: number = 365,
): void {
  if (typeof document === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
