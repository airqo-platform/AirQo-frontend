import {
  getItemWithExpiry,
  getLocalStorageItem,
  getSessionStorageItem,
  hasLocalStorageItem,
  isLocalStorageAvailable,
  removeLocalStorageItem,
  removeSessionStorageItem,
  setItemWithExpiry,
  setLocalStorageItem,
  setSessionStorageItem,
} from '../storageUtils';

function createStorageMock() {
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
    _resetStore: () => {
      store = {};
    },
  };
}

let localStorageMock: ReturnType<typeof createStorageMock>;
let sessionStorageMock: ReturnType<typeof createStorageMock>;

beforeEach(() => {
  localStorageMock = createStorageMock();
  sessionStorageMock = createStorageMock();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });
  jest.restoreAllMocks();
});

describe('storageUtils', () => {
  describe('getLocalStorageItem', () => {
    it('returns parsed JSON for existing key', () => {
      localStorageMock._getStore()['test'] = JSON.stringify({ a: 1 });
      const result = getLocalStorageItem<{ a: number }>('test');
      expect(result).toEqual({ a: 1 });
    });

    it('returns null for non-existing key', () => {
      expect(getLocalStorageItem('missing')).toBeNull();
    });

    it('returns null for corrupted JSON', () => {
      localStorageMock._getStore()['bad'] = '{not json}';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      expect(getLocalStorageItem('bad')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('returns string values correctly', () => {
      localStorageMock._getStore()['str'] = JSON.stringify('hello');
      expect(getLocalStorageItem<string>('str')).toBe('hello');
    });

    it('returns array values correctly', () => {
      localStorageMock._getStore()['arr'] = JSON.stringify([1, 2, 3]);
      expect(getLocalStorageItem<number[]>('arr')).toEqual([1, 2, 3]);
    });
  });

  describe('setLocalStorageItem', () => {
    it('stores and retrieves object', () => {
      const success = setLocalStorageItem('key', { foo: 'bar' });
      expect(success).toBe(true);
      expect(getLocalStorageItem('key')).toEqual({ foo: 'bar' });
    });

    it('returns true on success', () => {
      expect(setLocalStorageItem('k', 'v')).toBe(true);
    });

    it('overwrites existing value', () => {
      setLocalStorageItem('k', 'first');
      setLocalStorageItem('k', 'second');
      expect(getLocalStorageItem('k')).toBe('second');
    });

    it('handles storage full error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      expect(setLocalStorageItem('k', 'v')).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeLocalStorageItem', () => {
    it('removes an existing item', () => {
      setLocalStorageItem('toRemove', 'value');
      removeLocalStorageItem('toRemove');
      expect(getLocalStorageItem('toRemove')).toBeNull();
    });

    it('does not throw for non-existing key', () => {
      expect(() => removeLocalStorageItem('nonexistent')).not.toThrow();
    });
  });

  describe('getSessionStorageItem', () => {
    it('returns parsed JSON', () => {
      sessionStorageMock._getStore()['test'] = JSON.stringify({ x: 10 });
      expect(getSessionStorageItem<{ x: number }>('test')).toEqual({ x: 10 });
    });

    it('returns null for missing key', () => {
      expect(getSessionStorageItem('missing')).toBeNull();
    });

    it('returns null for corrupted JSON', () => {
      sessionStorageMock._getStore()['bad'] = 'INVALID{{{';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      expect(getSessionStorageItem('bad')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setSessionStorageItem', () => {
    it('stores and retrieves value', () => {
      expect(setSessionStorageItem('k', { data: true })).toBe(true);
      expect(getSessionStorageItem('k')).toEqual({ data: true });
    });

    it('handles storage full error', () => {
      sessionStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      expect(setSessionStorageItem('k', 'v')).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeSessionStorageItem', () => {
    it('removes an existing item', () => {
      setSessionStorageItem('toRemove', 'value');
      removeSessionStorageItem('toRemove');
      expect(getSessionStorageItem('toRemove')).toBeNull();
    });

    it('does not throw for non-existing key', () => {
      expect(() => removeSessionStorageItem('nonexistent')).not.toThrow();
    });
  });

  describe('hasLocalStorageItem', () => {
    it('returns true for existing key', () => {
      localStorageMock._getStore()['exists'] = JSON.stringify(true);
      expect(hasLocalStorageItem('exists')).toBe(true);
    });

    it('returns false for missing key', () => {
      expect(hasLocalStorageItem('missing')).toBe(false);
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is functional', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('returns false when setItem throws', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(isLocalStorageAvailable()).toBe(false);
    });
  });

  describe('getItemWithExpiry', () => {
    it('returns value when not expired', () => {
      const before = Date.now();
      const item = { value: 'data', expiry: before + 60000 };
      localStorageMock._getStore()['fresh'] = JSON.stringify(item);
      expect(getItemWithExpiry('fresh')).toBe('data');
    });

    it('returns null and removes item when expired', () => {
      const item = { value: 'old', expiry: Date.now() - 1000 };
      localStorageMock._getStore()['expired'] = JSON.stringify(item);
      expect(getItemWithExpiry('expired')).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('expired');
    });

    it('returns null for missing key', () => {
      expect(getItemWithExpiry('nonexistent')).toBeNull();
    });

    it('handles objects with expiry', () => {
      const item = { value: { nested: true }, expiry: Date.now() + 60000 };
      localStorageMock._getStore()['obj'] = JSON.stringify(item);
      expect(getItemWithExpiry<{ nested: boolean }>('obj')).toEqual({
        nested: true,
      });
    });
  });

  describe('setItemWithExpiry', () => {
    it('stores value with expiry', () => {
      const before = Date.now();
      setItemWithExpiry('key', 'val', 1000);
      const stored = JSON.parse(localStorageMock._getStore()['key']);
      expect(stored.value).toBe('val');
      expect(stored.expiry).toBeGreaterThanOrEqual(before + 1000);
      expect(stored.expiry).toBeLessThanOrEqual(before + 1001);
    });

    it('returns true on success', () => {
      expect(setItemWithExpiry('k', 'v', 1000)).toBe(true);
    });
  });
});
