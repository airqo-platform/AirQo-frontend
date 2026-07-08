import { cn } from '../cn';

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('should handle no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should handle undefined values', () => {
    const result = cn('text-red-500', undefined, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle null values', () => {
    const result = cn('text-red-500', null, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle false values', () => {
    const result = cn('text-red-500', false, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle object with conditional classes', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
    });
    expect(result).toBe('text-red-500');
  });

  it('should handle array of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500']);
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle duplicate classes', () => {
    const result = cn('text-red-500', 'text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should handle mixed types', () => {
    const result = cn('text-red-500', undefined, null, false, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle empty string', () => {
    expect(cn('')).toBe('');
  });
});
