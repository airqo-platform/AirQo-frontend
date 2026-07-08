import { deslugify, slugify, slugifyForUrl } from '../slugify';

describe('slugify', () => {
  it('should convert text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('should handle underscores as hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('--hello-world--')).toBe('hello-world');
  });

  it('should collapse multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(slugify('!@#$%^&*()')).toBe('');
  });

  it('should trim whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('should handle numbers', () => {
    expect(slugify('hello123world')).toBe('hello123world');
  });

  it('should handle mixed case with numbers', () => {
    expect(slugify('Hello World 123')).toBe('hello-world-123');
  });

  it('should handle single word', () => {
    expect(slugify('hello')).toBe('hello');
  });
});

describe('slugifyForUrl', () => {
  it('should convert text to URL-friendly slug', () => {
    expect(slugifyForUrl('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugifyForUrl('Hello, World!')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugifyForUrl('Hello   World')).toBe('hello-world');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugifyForUrl('--hello world--')).toBe('hello-world');
  });

  it('should collapse multiple spaces to single hyphen', () => {
    expect(slugifyForUrl('hello   world')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugifyForUrl('')).toBe('');
  });

  it('should trim whitespace', () => {
    expect(slugifyForUrl('  hello world  ')).toBe('hello-world');
  });

  it('should handle numbers', () => {
    expect(slugifyForUrl('hello123world')).toBe('hello123world');
  });

  it('should handle mixed case', () => {
    expect(slugifyForUrl('Hello World 123')).toBe('hello-world-123');
  });

  it('should handle single word', () => {
    expect(slugifyForUrl('hello')).toBe('hello');
  });

  it('should handle special characters in middle', () => {
    expect(slugifyForUrl('hello@world#test')).toBe('helloworldtest');
  });
});

describe('deslugify', () => {
  it('should replace hyphens with spaces', () => {
    expect(deslugify('hello-world')).toBe('Hello World');
  });

  it('should capitalize first letter of each word', () => {
    expect(deslugify('hello-world')).toBe('Hello World');
  });

  it('should handle single word', () => {
    expect(deslugify('hello')).toBe('Hello');
  });

  it('should handle multiple hyphens', () => {
    expect(deslugify('hello-world-foo')).toBe('Hello World Foo');
  });

  it('should handle empty string', () => {
    expect(deslugify('')).toBe('');
  });

  it('should handle string with no hyphens', () => {
    expect(deslugify('hello')).toBe('Hello');
  });

  it('should handle already capitalized text', () => {
    expect(deslugify('Hello-World')).toBe('Hello World');
  });

  it('should handle numbers', () => {
    expect(deslugify('hello-world-123')).toBe('Hello World 123');
  });
});
