import { isValidGlossaryContent } from '../glossaryValidator';

describe('glossaryValidator', () => {
  describe('isValidGlossaryContent', () => {
    it('returns false for empty string', () => {
      expect(isValidGlossaryContent('')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isValidGlossaryContent(null as any)).toBe(false);
      expect(isValidGlossaryContent(undefined as any)).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
      expect(isValidGlossaryContent('   ')).toBe(false);
    });

    it('returns false for <p><br/></p>', () => {
      expect(isValidGlossaryContent('<p><br/></p>')).toBe(false);
    });

    it('returns false for "No details available yet."', () => {
      expect(isValidGlossaryContent('No details available yet.')).toBe(false);
    });

    it('returns false for "Details coming soon."', () => {
      expect(isValidGlossaryContent('Details coming soon.')).toBe(false);
    });

    it('returns true for valid content', () => {
      expect(isValidGlossaryContent('<p>Real glossary content</p>')).toBe(true);
    });

    it('returns true for content with multiple paragraphs', () => {
      const html = '<p>First paragraph</p><p>Second paragraph</p>';
      expect(isValidGlossaryContent(html)).toBe(true);
    });

    it('removes empty paragraphs and validates remaining content', () => {
      const html = '<p><br/></p><p>Real content</p>';
      expect(isValidGlossaryContent(html)).toBe(true);
    });

    it('returns true when non-empty paragraph remains after cleanup', () => {
      const html = '<p><br/></p><p>   </p>';
      expect(isValidGlossaryContent(html)).toBe(true);
    });

    it('handles br with spaces inside p tags', () => {
      expect(isValidGlossaryContent('<p> <br /> </p>')).toBe(false);
    });

    it('handles self-closing br tag', () => {
      expect(isValidGlossaryContent('<p><br/></p>')).toBe(false);
    });

    it('returns true for plain text content', () => {
      expect(isValidGlossaryContent('Just plain text glossary entry')).toBe(
        true,
      );
    });

    it('returns true for content with HTML formatting', () => {
      const html = '<p><strong>Bold term</strong> - definition here</p>';
      expect(isValidGlossaryContent(html)).toBe(true);
    });

    it('returns false for content that is only an invalid snippet among tags', () => {
      expect(isValidGlossaryContent('<div>Details coming soon.</div>')).toBe(
        false,
      );
    });
  });
});
