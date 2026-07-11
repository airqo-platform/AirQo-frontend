import {
  formatDate,
  formatTime,
  formatDateTime,
  formatWithPattern,
  formatRelativeTime,
  isValidDate,
  parseDate,
  DATE_FORMATS,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('returns N/A for null', () => {
      expect(formatDate(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('returns Invalid Date for invalid string', () => {
      expect(formatDate('not-a-date')).toBe('Invalid Date');
    });

    it('formats Date object', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date);
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });

    it('formats ISO string', () => {
      const result = formatDate('2024-01-15T00:00:00Z');
      expect(result).toContain('2024');
    });

    it('formats timestamp number', () => {
      const result = formatDate(new Date(2024, 0, 15).getTime());
      expect(result).toContain('2024');
    });

    it('applies custom options override', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date, { year: 'numeric' });
      expect(result).toContain('2024');
    });
  });

  describe('formatTime', () => {
    it('returns N/A for null', () => {
      expect(formatTime(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatTime(undefined)).toBe('N/A');
    });

    it('returns formatted time for valid date', () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const result = formatTime(date);
      expect(result).toContain('30');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDateTime', () => {
    it('returns N/A for null', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatDateTime(undefined)).toBe('N/A');
    });

    it('returns formatted date+time', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatDateTime(date);
      expect(result).toContain('2024');
      expect(result).toContain('30');
      expect(result.length).toBeGreaterThan(5);
    });
  });

  describe('formatWithPattern', () => {
    it('returns N/A for null', () => {
      expect(formatWithPattern(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatWithPattern(undefined)).toBe('N/A');
    });

    it('formats with yyyy-MM-dd pattern', () => {
      const date = new Date(2024, 0, 15);
      const result = formatWithPattern(date, 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });

    it('formats with MMM dd, yyyy pattern', () => {
      const date = new Date(2024, 0, 15);
      const result = formatWithPattern(date, 'MMM dd, yyyy');
      expect(result).toBe('Jan 15, 2024');
    });

    it('uses default pattern yyyy-MM-dd', () => {
      const date = new Date(2024, 0, 15);
      const result = formatWithPattern(date);
      expect(result).toBe('2024-01-15');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns N/A for null', () => {
      expect(formatRelativeTime(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatRelativeTime(undefined)).toBe('N/A');
    });

    it('returns relative time string containing "ago" for past date', () => {
      const pastDate = new Date(Date.now() - 86400000);
      const result = formatRelativeTime(pastDate);
      expect(result).toMatch(/ago/);
    });

    it('returns relative time string containing "in" for future date', () => {
      const futureDate = new Date(Date.now() + 86400000);
      const result = formatRelativeTime(futureDate);
      expect(result).toMatch(/in/);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid Date', () => {
      expect(isValidDate(new Date())).toBe(true);
    });

    it('returns true for valid ISO string', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
    });

    it('returns true for valid timestamp', () => {
      expect(isValidDate(Date.now())).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it('returns false for invalid string', () => {
      expect(isValidDate('not-a-date')).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('returns Date for valid input', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('returns Date for Date object', () => {
      const date = new Date(2024, 0, 15);
      const result = parseDate(date);
      expect(result).toBeInstanceOf(Date);
    });

    it('returns null for null', () => {
      expect(parseDate(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(parseDate(undefined)).toBeNull();
    });

    it('returns null for invalid string', () => {
      expect(parseDate('not-a-date')).toBeNull();
    });
  });

  describe('DATE_FORMATS', () => {
    it('all format constants are strings', () => {
      Object.values(DATE_FORMATS).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });

    it('ISO_DATE is yyyy-MM-dd', () => {
      expect(DATE_FORMATS.ISO_DATE).toBe('yyyy-MM-dd');
    });

    it('US_DATE is MM/dd/yyyy', () => {
      expect(DATE_FORMATS.US_DATE).toBe('MM/dd/yyyy');
    });
  });
});
