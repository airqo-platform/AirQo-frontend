import {
  normalizeDeviceData,
  normalizeDevicesData,
  getDeviceDisplayValue,
  isValidDeviceData,
  type RawDeviceData,
} from '../deviceUtils';

const makeDevice = (overrides: Partial<RawDeviceData> = {}): RawDeviceData => ({
  _id: 'dev-1',
  ...overrides,
});

describe('normalizeDeviceData', () => {
  describe('id mapping', () => {
    it('maps _id to id', () => {
      expect(normalizeDeviceData(makeDevice({ _id: 'abc' })).id).toBe('abc');
    });
  });

  describe('name resolution', () => {
    it('maps long_name to name', () => {
      expect(
        normalizeDeviceData(makeDevice({ long_name: 'Device One' })).name
      ).toBe('Device One');
    });

    it('falls back to _id when long_name is missing', () => {
      expect(
        normalizeDeviceData(makeDevice({ _id: 'dev-fallback' })).name
      ).toBe('dev-fallback');
    });

    it('falls back to "Unknown Device" when both long_name and _id are missing', () => {
      expect(normalizeDeviceData({} as RawDeviceData).name).toBe(
        'Unknown Device'
      );
    });
  });

  describe('status', () => {
    it('maps rawOnlineStatus true to online', () => {
      expect(
        normalizeDeviceData(makeDevice({ rawOnlineStatus: true })).status
      ).toBe('online');
    });

    it('maps rawOnlineStatus false to offline', () => {
      expect(
        normalizeDeviceData(makeDevice({ rawOnlineStatus: false })).status
      ).toBe('offline');
    });

    it('maps rawOnlineStatus undefined to unknown', () => {
      expect(normalizeDeviceData(makeDevice()).status).toBe('unknown');
    });
  });

  describe('lastData', () => {
    it('formats valid ISO string with expected date parts', () => {
      const result = normalizeDeviceData(
        makeDevice({ lastRawData: '2024-01-15T10:30:00Z' })
      );
      expect(result.lastData).not.toBe('Never');
      expect(result.lastData).not.toBe('Invalid Date');
      expect(result.lastData.length).toBeGreaterThan(0);
    });

    it('returns "Never" when lastRawData is missing', () => {
      expect(normalizeDeviceData(makeDevice()).lastData).toBe('Never');
    });

    it('returns "Invalid Date" for an invalid date string', () => {
      const result = normalizeDeviceData(
        makeDevice({ lastRawData: 'not-a-date' })
      );
      expect(result.lastData).toBe('Invalid Date');
    });
  });

  describe('_raw preservation', () => {
    it('includes _raw with the original device object', () => {
      const raw = makeDevice({ long_name: 'Test' });
      const result = normalizeDeviceData(raw);
      expect(result._raw).toBe(raw);
    });
  });
});

describe('normalizeDevicesData', () => {
  it('maps array of devices', () => {
    const raw = [
      makeDevice({ _id: '1', long_name: 'A' }),
      makeDevice({ _id: '2', long_name: 'B' }),
    ];
    const result = normalizeDevicesData(raw);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('returns empty array for empty input', () => {
    expect(normalizeDevicesData([])).toEqual([]);
  });
});

describe('getDeviceDisplayValue', () => {
  const device = makeDevice({
    long_name: 'Device One',
    rawOnlineStatus: true,
    lastRawData: '2024-01-15T10:30:00Z',
  });

  it('returns name with long_name', () => {
    expect(getDeviceDisplayValue(device, 'name')).toBe('Device One');
  });

  it('returns name fallback to _id', () => {
    expect(getDeviceDisplayValue(makeDevice({ _id: 'dev-x' }), 'name')).toBe(
      'dev-x'
    );
  });

  it('returns status for online', () => {
    expect(getDeviceDisplayValue(device, 'status')).toBe('online');
  });

  it('returns status for offline', () => {
    expect(
      getDeviceDisplayValue(makeDevice({ rawOnlineStatus: false }), 'status')
    ).toBe('offline');
  });

  it('returns status for unknown', () => {
    expect(getDeviceDisplayValue(makeDevice(), 'status')).toBe('unknown');
  });

  it('returns formatted lastData with date parts', () => {
    const value = getDeviceDisplayValue(device, 'lastData');
    expect(value).toContain('2024');
    expect(value).not.toBe('Never');
  });

  it('returns "Never" for missing lastRawData', () => {
    expect(getDeviceDisplayValue(makeDevice(), 'lastData')).toBe('Never');
  });
});

describe('isValidDeviceData', () => {
  it('returns true for objects with _id string', () => {
    expect(isValidDeviceData({ _id: 'abc' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidDeviceData(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidDeviceData(undefined)).toBe(false);
  });

  it('returns false for non-object (number)', () => {
    expect(isValidDeviceData(42)).toBe(false);
  });

  it('returns false for non-object (string)', () => {
    expect(isValidDeviceData('string')).toBe(false);
  });

  it('returns false for missing _id', () => {
    expect(isValidDeviceData({ name: 'test' })).toBe(false);
  });

  it('returns false for non-string _id', () => {
    expect(isValidDeviceData({ _id: 123 })).toBe(false);
  });
});
