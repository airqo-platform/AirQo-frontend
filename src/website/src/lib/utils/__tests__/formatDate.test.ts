import {
  formatDate,
  formatISO,
  formatRelativeTime,
  isValidDate,
} from '../formatDate';

describe('formatDate', () => {
  it('should format a Date object to a readable string', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toBe('January 15, 2024');
  });

  it('should format a date string to a readable string', () => {
    const result = formatDate('2024-06-20');
    expect(result).toBe('June 20, 2024');
  });

  it('should format ISO date string', () => {
    const result = formatDate('2024-12-25T10:30:00Z');
    expect(result).toBe('December 25, 2024');
  });

  it('should use default en-US locale', () => {
    const date = new Date('2024-03-01');
    const result = formatDate(date);
    expect(result).toBe('March 1, 2024');
  });

  it('should allow overriding options', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, { month: 'short' });
    expect(result).toBe('Jan 15, 2024');
  });

  it('should override day when options provide day', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, { day: '2-digit' });
    expect(result).toBe('January 15, 2024');
  });

  it('should handle dates at the start of the year', () => {
    const date = new Date('2024-01-01');
    const result = formatDate(date);
    expect(result).toBe('January 1, 2024');
  });

  it('should handle dates at the end of the year', () => {
    const date = new Date('2024-12-31');
    const result = formatDate(date);
    expect(result).toBe('December 31, 2024');
  });

  it('should handle leap year dates', () => {
    const date = new Date('2024-02-29');
    const result = formatDate(date);
    expect(result).toBe('February 29, 2024');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "Just now" for a recent time', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-20T11:59:30');
    expect(formatRelativeTime(date)).toBe('Just now');
  });

  it('should return minutes for less than an hour', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-20T11:45:00');
    expect(formatRelativeTime(date)).toBe('15 minutes ago');
  });

  it('should return singular minute', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-20T11:59:00');
    expect(formatRelativeTime(date)).toBe('1 minute ago');
  });

  it('should return hours for less than a day', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-20T09:00:00');
    expect(formatRelativeTime(date)).toBe('3 hours ago');
  });

  it('should return singular hour', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-20T11:00:00');
    expect(formatRelativeTime(date)).toBe('1 hour ago');
  });

  it('should return days for less than a month', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-17T12:00:00');
    expect(formatRelativeTime(date)).toBe('3 days ago');
  });

  it('should return singular day', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-06-19T12:00:00');
    expect(formatRelativeTime(date)).toBe('1 day ago');
  });

  it('should return months for less than a year', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-03-20T12:00:00');
    expect(formatRelativeTime(date)).toBe('3 months ago');
  });

  it('should return singular month', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2024-05-20T12:00:00');
    expect(formatRelativeTime(date)).toBe('1 month ago');
  });

  it('should return years for dates older than a year', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2022-06-20T12:00:00');
    expect(formatRelativeTime(date)).toBe('2 years ago');
  });

  it('should return singular year', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = new Date('2023-06-20T12:00:00');
    expect(formatRelativeTime(date)).toBe('1 year ago');
  });

  it('should handle date string input', () => {
    jest.setSystemTime(new Date('2024-06-20T12:00:00'));
    const date = '2024-06-20T11:45:00';
    expect(formatRelativeTime(date)).toBe('15 minutes ago');
  });
});

describe('formatISO', () => {
  it('should format a Date object to ISO string', () => {
    const date = new Date('2024-06-20T12:30:45.000Z');
    const result = formatISO(date);
    expect(result).toBe('2024-06-20T12:30:45.000Z');
  });

  it('should format a date string to ISO string', () => {
    const result = formatISO('2024-01-15');
    expect(result).toContain('2024-01-15');
    expect(result).toContain('T');
  });

  it('should handle dates at midnight', () => {
    const date = new Date('2024-06-20T00:00:00.000Z');
    const result = formatISO(date);
    expect(result).toBe('2024-06-20T00:00:00.000Z');
  });

  it('should always output UTC timezone', () => {
    const date = new Date('2024-06-20T12:00:00+05:30');
    const result = formatISO(date);
    expect(result).toContain('Z');
    expect(result).toBe('2024-06-20T06:30:00.000Z');
  });
});

describe('isValidDate', () => {
  it('should return true for valid Date object', () => {
    expect(isValidDate(new Date())).toBe(true);
  });

  it('should return true for valid date string', () => {
    expect(isValidDate('2024-06-20')).toBe(true);
  });

  it('should return true for valid ISO string', () => {
    expect(isValidDate('2024-06-20T12:00:00Z')).toBe(true);
  });

  it('should return false for invalid date string', () => {
    expect(isValidDate('not-a-date')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('should return false for random text', () => {
    expect(isValidDate('hello world')).toBe(false);
  });

  it('should return true for epoch zero', () => {
    const date = new Date(0);
    expect(isValidDate(date)).toBe(true);
  });

  it('should return true for future dates', () => {
    expect(isValidDate('2099-12-31')).toBe(true);
  });

  it('should return true for past dates', () => {
    expect(isValidDate('1900-01-01')).toBe(true);
  });
});
