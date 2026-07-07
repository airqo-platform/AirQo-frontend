import {
  acceptAllCookies,
  acceptNecessaryCookies,
  clearConsentPreferences,
  deleteCookie,
  dismissConsentBanner,
  getConsentPreferences,
  getCookie,
  hasAnalyticsConsent,
  hasConsent,
  hasMarketingConsent,
  setConsentPreferences,
  setCookie,
  shouldShowConsentBanner,
} from '../cookieConsent';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
    _getStore: () => store,
    _reset: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  localStorageMock._reset();
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('cookieConsent', () => {
  describe('getConsentPreferences', () => {
    it('returns null when no consent stored', () => {
      expect(getConsentPreferences()).toBeNull();
    });

    it('returns parsed preferences when stored', () => {
      const prefs = {
        necessary: true,
        analytics: true,
        marketing: false,
        timestamp: 12345,
      };
      localStorageMock._getStore()['airqo_cookie_consent'] =
        JSON.stringify(prefs);
      expect(getConsentPreferences()).toEqual(prefs);
    });

    it('returns null for invalid JSON', () => {
      localStorageMock._getStore()['airqo_cookie_consent'] = 'NOT_JSON';
      expect(getConsentPreferences()).toBeNull();
    });

    it('returns null for missing required fields', () => {
      localStorageMock._getStore()['airqo_cookie_consent'] = JSON.stringify({
        necessary: true,
      });
      expect(getConsentPreferences()).toBeNull();
    });

    it('returns null for wrong field types', () => {
      localStorageMock._getStore()['airqo_cookie_consent'] = JSON.stringify({
        necessary: 'yes',
        analytics: 1,
        marketing: 'true',
        timestamp: 'now',
      });
      expect(getConsentPreferences()).toBeNull();
    });
  });

  describe('setConsentPreferences', () => {
    it('saves preferences with timestamp', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: false,
      });
      const stored = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (call: any[]) => call[0] === 'airqo_cookie_consent',
        )[1],
      );
      expect(stored.necessary).toBe(true);
      expect(stored.analytics).toBe(true);
      expect(stored.marketing).toBe(false);
      expect(typeof stored.timestamp).toBe('number');
    });

    it('always sets necessary to true', () => {
      setConsentPreferences({
        necessary: false,
        analytics: true,
        marketing: true,
      });
      const stored = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (call: any[]) => call[0] === 'airqo_cookie_consent',
        )[1],
      );
      expect(stored.necessary).toBe(true);
    });

    it('sets timestamp to current time', () => {
      const now = Date.now();
      setConsentPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
      });
      const stored = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (call: any[]) => call[0] === 'airqo_cookie_consent',
        )[1],
      );
      expect(stored.timestamp).toBe(now);
    });
  });

  describe('hasConsent', () => {
    it('returns false when no consent', () => {
      expect(hasConsent()).toBe(false);
    });

    it('returns true when consent exists', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: false,
      });
      expect(hasConsent()).toBe(true);
    });
  });

  describe('hasAnalyticsConsent', () => {
    it('returns false when no consent', () => {
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('returns true when analytics consent granted', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: false,
      });
      expect(hasAnalyticsConsent()).toBe(true);
    });

    it('returns false when analytics consent denied', () => {
      setConsentPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
      });
      expect(hasAnalyticsConsent()).toBe(false);
    });
  });

  describe('hasMarketingConsent', () => {
    it('returns false when no consent', () => {
      expect(hasMarketingConsent()).toBe(false);
    });

    it('returns true when marketing consent granted', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: true,
      });
      expect(hasMarketingConsent()).toBe(true);
    });

    it('returns false when marketing consent denied', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: false,
      });
      expect(hasMarketingConsent()).toBe(false);
    });
  });

  describe('acceptAllCookies', () => {
    it('sets all consent to true', () => {
      acceptAllCookies();
      expect(hasConsent()).toBe(true);
      expect(hasAnalyticsConsent()).toBe(true);
      expect(hasMarketingConsent()).toBe(true);
    });
  });

  describe('acceptNecessaryCookies', () => {
    it('sets only necessary to true', () => {
      acceptNecessaryCookies();
      expect(hasConsent()).toBe(true);
      expect(hasAnalyticsConsent()).toBe(false);
      expect(hasMarketingConsent()).toBe(false);
    });
  });

  describe('clearConsentPreferences', () => {
    it('removes consent and banner dismissed keys', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: true,
      });
      localStorageMock._getStore()['airqo_consent_banner_dismissed'] =
        JSON.stringify({
          timestamp: Date.now(),
          expiresAt: Date.now() + 1000,
        });
      clearConsentPreferences();
      expect(getConsentPreferences()).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'airqo_cookie_consent',
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'airqo_consent_banner_dismissed',
      );
    });
  });

  describe('shouldShowConsentBanner', () => {
    it('returns true when no consent and no dismissal', () => {
      expect(shouldShowConsentBanner()).toBe(true);
    });

    it('returns false when consent exists', () => {
      setConsentPreferences({
        necessary: true,
        analytics: true,
        marketing: true,
      });
      expect(shouldShowConsentBanner()).toBe(false);
    });

    it('returns false when banner recently dismissed', () => {
      const dismissInfo = {
        timestamp: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      localStorageMock._getStore()['airqo_consent_banner_dismissed'] =
        JSON.stringify(dismissInfo);
      expect(shouldShowConsentBanner()).toBe(false);
    });

    it('returns true when dismissal has expired', () => {
      const dismissInfo = {
        timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 1000,
      };
      localStorageMock._getStore()['airqo_consent_banner_dismissed'] =
        JSON.stringify(dismissInfo);
      expect(shouldShowConsentBanner()).toBe(true);
    });

    it('returns true when dismissed key has invalid JSON', () => {
      localStorageMock._getStore()['airqo_consent_banner_dismissed'] =
        'invalid';
      expect(shouldShowConsentBanner()).toBe(true);
    });
  });

  describe('dismissConsentBanner', () => {
    it('stores dismissal info with 7-day expiry', () => {
      const before = Date.now();
      dismissConsentBanner();
      const stored = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (call: any[]) => call[0] === 'airqo_consent_banner_dismissed',
        )[1],
      );
      expect(stored.timestamp).toBeGreaterThanOrEqual(before);
      const expectedExpiry = 7 * 24 * 60 * 60 * 1000;
      expect(stored.expiresAt - stored.timestamp).toBe(expectedExpiry);
    });
  });

  describe('getCookie', () => {
    it('returns cookie value for existing cookie', () => {
      jest
        .spyOn(document, 'cookie', 'get')
        .mockReturnValue('name=value; other=test');
      expect(getCookie('name')).toBe('value');
    });

    it('returns null for non-existing cookie', () => {
      jest.spyOn(document, 'cookie', 'get').mockReturnValue('name=value');
      expect(getCookie('missing')).toBeNull();
    });

    it('handles encoded cookie values', () => {
      jest
        .spyOn(document, 'cookie', 'get')
        .mockReturnValue('encoded=hello%20world');
      expect(getCookie('encoded')).toBe('hello world');
    });

    it('handles cookie name with special characters', () => {
      jest.spyOn(document, 'cookie', 'get').mockReturnValue('test.name=value');
      expect(getCookie('test.name')).toBe('value');
    });
  });

  describe('setCookie', () => {
    it('sets a cookie with correct format', () => {
      const spy = jest.spyOn(document, 'cookie', 'set');
      setCookie('mycookie', 'myvalue');
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('mycookie=myvalue'),
      );
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('path=/'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('SameSite=Lax'));
      spy.mockRestore();
    });

    it('sets cookie with custom expiry', () => {
      const spy = jest.spyOn(document, 'cookie', 'set');
      setCookie('mycookie', 'myvalue', 30);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('mycookie=myvalue'),
      );
      spy.mockRestore();
    });
  });

  describe('deleteCookie', () => {
    it('sets cookie with past expiry', () => {
      const spy = jest.spyOn(document, 'cookie', 'set');
      deleteCookie('mycookie');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('mycookie='));
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('expires=Thu, 01 Jan 1970'),
      );
      spy.mockRestore();
    });
  });
});
