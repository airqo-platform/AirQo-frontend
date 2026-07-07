import { isValidHTMLContent, sanitizeAndCleanHTML } from '../htmlValidator';

jest.mock('dompurify', () => {
  const mockSanitize = jest.fn((html: string) => html);
  return {
    __esModule: true,
    default: jest.fn(() => ({
      sanitize: mockSanitize,
    })),
    _mockSanitize: mockSanitize,
  };
});

describe('htmlValidator', () => {
  describe('isValidHTMLContent', () => {
    it('returns true for valid HTML', () => {
      expect(isValidHTMLContent('<p>Hello world</p>')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(isValidHTMLContent('')).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
      expect(isValidHTMLContent('   ')).toBe(false);
    });

    it('returns false for <p><br/></p>', () => {
      expect(isValidHTMLContent('<p><br/></p>')).toBe(false);
    });

    it('returns false for "No details available yet."', () => {
      expect(isValidHTMLContent('No details available yet.')).toBe(false);
    });

    it('returns false for "Details coming soon."', () => {
      expect(isValidHTMLContent('Details coming soon.')).toBe(false);
    });

    it('returns true for content that does not contain invalid snippets', () => {
      expect(isValidHTMLContent('<div>Some real content</div>')).toBe(true);
    });

    it('returns false for content containing invalid snippet', () => {
      expect(isValidHTMLContent('<p>Before</p><p><br/></p><p>After</p>')).toBe(
        false,
      );
    });

    it('returns true for standalone paragraph with text', () => {
      expect(isValidHTMLContent('<p>Real content here</p>')).toBe(true);
    });

    it('handles content with HTML entities', () => {
      expect(isValidHTMLContent('<p>&amp; &lt;3</p>')).toBe(true);
    });
  });

  describe('sanitizeAndCleanHTML', () => {
    describe('SSR path (typeof window === undefined)', () => {
      const originalWindow = global.window;

      beforeAll(() => {
        // @ts-expect-error - testing SSR
        delete global.window;
      });

      afterAll(() => {
        global.window = originalWindow;
      });

      it('returns empty string for falsy input', () => {
        expect(sanitizeAndCleanHTML('')).toBe('');
      });

      it('removes script tags', () => {
        const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
        expect(sanitizeAndCleanHTML(html)).toBe('<p>Hello</p><p>World</p>');
      });

      it('removes inline event handlers', () => {
        const html = '<div onclick="alert(1)">Content</div>';
        expect(sanitizeAndCleanHTML(html)).not.toContain('onclick');
      });

      it('removes javascript: URIs', () => {
        const html = '<a href="javascript:alert(1)">Link</a>';
        const result = sanitizeAndCleanHTML(html);
        expect(result).not.toContain('javascript:');
        expect(result).toContain('href="#"');
      });

      it('removes data-external-decorated attribute', () => {
        const html = '<div data-external-decorated="true">Content</div>';
        expect(sanitizeAndCleanHTML(html)).not.toContain(
          'data-external-decorated',
        );
      });

      it('preserves safe HTML', () => {
        const html = '<p class="safe">Hello <b>World</b></p>';
        expect(sanitizeAndCleanHTML(html)).toBe(html);
      });
    });

    describe('client path (window defined)', () => {
      it('sanitizes HTML through DOMPurify', () => {
        const html = '<p>Safe content</p>';
        const result = sanitizeAndCleanHTML(html);
        expect(result).toContain('Safe content');
      });

      it('removes data-external-decorated in client path', () => {
        const html = '<div data-external-decorated="true">Content</div>';
        const result = sanitizeAndCleanHTML(html);
        expect(result).not.toContain('data-external-decorated');
      });

      it('returns empty string for falsy input', () => {
        expect(sanitizeAndCleanHTML('')).toBe('');
      });

      it('passes config to DOMPurify sanitize', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { _mockSanitize } = require('dompurify') as {
          _mockSanitize: jest.Mock;
        };
        _mockSanitize.mockClear();
        sanitizeAndCleanHTML('<p>test</p>', { ALLOWED_TAGS: ['p'] });
        expect(_mockSanitize).toHaveBeenCalledWith('<p>test</p>', {
          ALLOWED_TAGS: ['p'],
        });
      });
    });
  });
});
