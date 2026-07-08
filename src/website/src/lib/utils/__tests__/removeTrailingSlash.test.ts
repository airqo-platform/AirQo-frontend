import removeTrailingSlash from '../removeTrailingSlash';

describe('removeTrailingSlash', () => {
  it('should remove trailing slash from URL', () => {
    expect(removeTrailingSlash('https://example.com/')).toBe(
      'https://example.com',
    );
  });

  it('should not modify URL without trailing slash', () => {
    expect(removeTrailingSlash('https://example.com')).toBe(
      'https://example.com',
    );
  });

  it('should remove single trailing slash', () => {
    expect(removeTrailingSlash('/home/')).toBe('/home');
  });

  it('should handle root path with slash', () => {
    expect(removeTrailingSlash('/')).toBe('');
  });

  it('should not remove slashes in the middle', () => {
    expect(removeTrailingSlash('https://example.com/path/')).toBe(
      'https://example.com/path',
    );
  });

  it('should handle multiple slashes at end', () => {
    expect(removeTrailingSlash('https://example.com//')).toBe(
      'https://example.com/',
    );
  });

  it('should handle empty string', () => {
    expect(removeTrailingSlash('')).toBe('');
  });

  it('should handle plain text without slashes', () => {
    expect(removeTrailingSlash('hello')).toBe('hello');
  });

  it('should handle complex URLs', () => {
    expect(removeTrailingSlash('https://example.com/path/to/resource/')).toBe(
      'https://example.com/path/to/resource',
    );
  });

  it('should handle URL with query params', () => {
    expect(removeTrailingSlash('https://example.com/?foo=bar')).toBe(
      'https://example.com/?foo=bar',
    );
  });

  it('should handle URL with fragment', () => {
    expect(removeTrailingSlash('https://example.com/#section')).toBe(
      'https://example.com/#section',
    );
  });

  it('should handle relative paths', () => {
    expect(removeTrailingSlash('./path/')).toBe('./path');
  });
});
