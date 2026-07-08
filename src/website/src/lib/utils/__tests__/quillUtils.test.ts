import { convertDeltaToHtml, renderContent } from '../quillUtils';

jest.mock('quill-delta-to-html', () => {
  return {
    QuillDeltaToHtmlConverter: jest.fn().mockImplementation((ops) => ({
      convert: jest
        .fn()
        .mockReturnValue(
          ops
            .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
            .join(''),
        ),
    })),
  };
});

jest.mock('../logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('quillUtils', () => {
  describe('convertDeltaToHtml', () => {
    it('returns empty string for null', () => {
      expect(convertDeltaToHtml(null as any)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(convertDeltaToHtml(undefined as any)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(convertDeltaToHtml('')).toBe('');
    });

    it('returns HTML string directly if already valid HTML', () => {
      const html = '<p>Hello world</p>';
      expect(convertDeltaToHtml(html)).toBe(html);
    });

    it('returns HTML with nested tags directly', () => {
      const html = '<div><span>text</span></div>';
      expect(convertDeltaToHtml(html)).toBe(html);
    });

    it('parses JSON string delta with ops', () => {
      const delta = JSON.stringify({
        ops: [{ insert: 'Hello world\n' }],
      });
      expect(convertDeltaToHtml(delta)).toBe('Hello world\n');
    });

    it('treats plain text as wrapped in <p> tags', () => {
      expect(convertDeltaToHtml('plain text')).toBe('<p>plain text</p>');
    });

    it('treats HTML-looking tags as HTML if isHtml matches', () => {
      const input = '<script>alert("xss")</script>';
      expect(convertDeltaToHtml(input)).toBe(input);
    });

    it('handles plain text with newlines', () => {
      const result = convertDeltaToHtml('line1\nline2');
      expect(result).toBe('<p>line1<br>line2</p>');
    });

    it('handles object input with ops array', () => {
      const delta = { ops: [{ insert: 'Test content\n' }] };
      const result = convertDeltaToHtml(delta);
      expect(result).toBe('Test content\n');
    });

    it('returns empty string for object without ops', () => {
      const logger = jest.requireMock('../logger').default;
      const result = convertDeltaToHtml({ noOps: true });
      expect(result).toBe('');
      expect(logger.warn).toHaveBeenCalled();
    });

    it('handles JSON string with nested braces', () => {
      const delta = JSON.stringify({
        ops: [{ insert: 'Content', attributes: { bold: true } }],
      });
      const result = convertDeltaToHtml(delta);
      expect(result).toContain('Content');
    });

    it('treats non-JSON-looking string as plain text', () => {
      const result = convertDeltaToHtml('not json at all');
      expect(result).toBe('<p>not json at all</p>');
    });

    it('handles invalid JSON string as plain text', () => {
      const logger = jest.requireMock('../logger').default;
      const result = convertDeltaToHtml('{invalid json');
      expect(result).toBe('<p>{invalid json</p>');
      expect(logger.error).toHaveBeenCalled();
    });

    it('returns empty string for number input', () => {
      const result = convertDeltaToHtml(42 as any);
      expect(result).toBe('');
    });

    it('escapes HTML entities in plain text', () => {
      const result = convertDeltaToHtml('Hello <b>World</b> & friends');
      expect(result).toContain('Hello &lt;b&gt;World&lt;/b&gt; &amp; friends');
    });

    it('escapes quotes in plain text', () => {
      const result = convertDeltaToHtml('She said "hello"');
      expect(result).toContain('&quot;hello&quot;');
    });
  });

  describe('renderContent', () => {
    it('delegates to convertDeltaToHtml', () => {
      expect(renderContent('<p>Hello</p>')).toBe('<p>Hello</p>');
    });

    it('handles null input', () => {
      expect(renderContent(null as any)).toBe('');
    });

    it('handles object input', () => {
      const delta = { ops: [{ insert: 'Rendered\n' }] };
      expect(renderContent(delta)).toBe('Rendered\n');
    });

    it('handles plain text', () => {
      expect(renderContent('just text')).toBe('<p>just text</p>');
    });
  });
});
