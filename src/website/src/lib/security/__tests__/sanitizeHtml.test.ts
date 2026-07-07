jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: jest.fn((dirty: string, config: any) => {
      if (config?.ALLOWED_TAGS?.length === 0) {
        return dirty.replace(/<[^>]*>/g, '');
      }
      return dirty
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
    }),
  },
}));

import DOMPurify from 'dompurify';

import { sanitizeHtml, sanitizeText } from '../sanitizeHtml';

const mockSanitize = DOMPurify.sanitize as jest.MockedFunction<
  typeof DOMPurify.sanitize
>;

describe('sanitizeHtml', () => {
  beforeEach(() => {
    mockSanitize.mockClear();
  });

  it('should return dirty string on server (typeof window undefined)', () => {
    const originalWindow = global.window;
    // @ts-expect-error - testing server environment
    delete global.window;

    const result = sanitizeHtml('<script>alert("xss")</script>');

    expect(result).toBe('<script>alert("xss")</script>');
    expect(mockSanitize).not.toHaveBeenCalled();

    global.window = originalWindow;
  });

  it('should sanitize HTML on client', () => {
    mockSanitize.mockReturnValue('safe content');

    const result = sanitizeHtml('<img src=x onerror=alert(1)>');

    expect(mockSanitize).toHaveBeenCalledWith(
      '<img src=x onerror=alert(1)>',
      expect.objectContaining({
        ALLOWED_TAGS: expect.arrayContaining(['b', 'i', 'a', 'p', 'div']),
        ALLOWED_ATTR: expect.arrayContaining(['href', 'target', 'src']),
        ALLOW_DATA_ATTR: false,
      }),
    );
    expect(result).toBe('safe content');
  });

  it('should pass correct allowed tags to DOMPurify', () => {
    mockSanitize.mockReturnValue('');

    sanitizeHtml('<p>test</p>');

    expect(mockSanitize).toHaveBeenCalledWith(
      '<p>test</p>',
      expect.objectContaining({
        ALLOWED_TAGS: expect.arrayContaining([
          'b',
          'i',
          'em',
          'strong',
          'a',
          'p',
          'br',
          'ul',
          'ol',
          'li',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'blockquote',
          'code',
          'pre',
          'div',
          'span',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'sub',
          'sup',
          'hr',
          'dl',
          'dt',
          'dd',
        ]),
      }),
    );
  });

  it('should pass correct allowed attributes to DOMPurify', () => {
    mockSanitize.mockReturnValue('');

    sanitizeHtml('<a href="#">link</a>');

    expect(mockSanitize).toHaveBeenCalledWith(
      '<a href="#">link</a>',
      expect.objectContaining({
        ALLOWED_ATTR: expect.arrayContaining([
          'href',
          'target',
          'rel',
          'src',
          'alt',
          'width',
          'height',
          'class',
          'id',
          'style',
          'title',
          'aria-hidden',
          'role',
        ]),
      }),
    );
  });

  it('should disable data attributes', () => {
    mockSanitize.mockReturnValue('');

    sanitizeHtml('<div data-test="value">content</div>');

    expect(mockSanitize).toHaveBeenCalledWith(
      '<div data-test="value">content</div>',
      expect.objectContaining({
        ALLOW_DATA_ATTR: false,
      }),
    );
  });

  it('should handle empty string input', () => {
    mockSanitize.mockReturnValue('');

    const result = sanitizeHtml('');

    expect(mockSanitize).toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('should handle complex HTML', () => {
    mockSanitize.mockReturnValue('<p>safe content</p>');

    const result = sanitizeHtml('<p>safe content</p>');

    expect(result).toBe('<p>safe content</p>');
  });
});

describe('sanitizeText', () => {
  beforeEach(() => {
    mockSanitize.mockClear();
  });

  it('should return dirty string on server', () => {
    const originalWindow = global.window;
    // @ts-expect-error - testing server environment
    delete global.window;

    const result = sanitizeText('<b>bold</b>');

    expect(result).toBe('<b>bold</b>');
    expect(mockSanitize).not.toHaveBeenCalled();

    global.window = originalWindow;
  });

  it('should strip all tags on client', () => {
    mockSanitize.mockReturnValue('just text');

    const result = sanitizeText('<b>bold</b> and <i>italic</i>');

    expect(mockSanitize).toHaveBeenCalledWith('<b>bold</b> and <i>italic</i>', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    expect(result).toBe('just text');
  });

  it('should strip script tags', () => {
    mockSanitize.mockReturnValue('text');

    const result = sanitizeText('text<script>alert("xss")</script>');

    expect(mockSanitize).toHaveBeenCalledWith(
      'text<script>alert("xss")</script>',
      {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      },
    );
    expect(result).toBe('text');
  });

  it('should strip all HTML attributes', () => {
    mockSanitize.mockReturnValue('text');

    sanitizeText('<a href="https://evil.com" onclick="steal()">link</a>');

    expect(mockSanitize).toHaveBeenCalledWith(
      '<a href="https://evil.com" onclick="steal()">link</a>',
      {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      },
    );
  });

  it('should handle empty string', () => {
    mockSanitize.mockReturnValue('');

    const result = sanitizeText('');

    expect(mockSanitize).toHaveBeenCalledWith('', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    expect(result).toBe('');
  });

  it('should handle nested tags', () => {
    mockSanitize.mockReturnValue('nested content');

    const result = sanitizeText(
      '<div><span><b>nested content</b></span></div>',
    );

    expect(mockSanitize).toHaveBeenCalledWith(
      '<div><span><b>nested content</b></span></div>',
      {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      },
    );
    expect(result).toBe('nested content');
  });

  it('should handle text without any tags', () => {
    mockSanitize.mockReturnValue('plain text');

    const result = sanitizeText('plain text');

    expect(mockSanitize).toHaveBeenCalledWith('plain text', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    expect(result).toBe('plain text');
  });
});
