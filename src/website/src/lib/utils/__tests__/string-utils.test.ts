import { formatString } from '../string-utils';

describe('formatString', () => {
  it('should capitalize first letter of each word', () => {
    expect(formatString('hello')).toBe('Hello');
  });

  it('should replace underscores with spaces', () => {
    expect(formatString('hello_world')).toBe('Hello World');
  });

  it('should capitalize each word after underscore', () => {
    expect(formatString('hello_world_foo')).toBe('Hello World Foo');
  });

  it('should handle single word', () => {
    expect(formatString('test')).toBe('Test');
  });

  it('should handle already capitalized', () => {
    expect(formatString('Hello_World')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(formatString('')).toBe('');
  });

  it('should handle single character', () => {
    expect(formatString('a')).toBe('A');
  });

  it('should handle multiple underscores', () => {
    expect(formatString('hello__world')).toBe('Hello  World');
  });

  it('should handle hyphens as well', () => {
    expect(formatString('hello-world')).toBe('Hello-world');
  });

  it('should handle numbers', () => {
    expect(formatString('hello_123')).toBe('Hello 123');
  });

  it('should handle lowercase input', () => {
    expect(formatString('this_is_a_test')).toBe('This Is A Test');
  });
});
