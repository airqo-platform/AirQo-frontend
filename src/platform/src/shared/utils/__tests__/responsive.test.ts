import { isMobile } from '../responsive';

describe('isMobile', () => {
  describe('below threshold', () => {
    it('returns true for 0', () => {
      expect(isMobile(0)).toBe(true);
    });

    it('returns true for 800', () => {
      expect(isMobile(800)).toBe(true);
    });

    it('returns true for 1023 (just below threshold)', () => {
      expect(isMobile(1023)).toBe(true);
    });
  });

  describe('at and above threshold', () => {
    it('returns false for 1024 (exactly at threshold)', () => {
      expect(isMobile(1024)).toBe(false);
    });

    it('returns false for 1025 (just above threshold)', () => {
      expect(isMobile(1025)).toBe(false);
    });

    it('returns false for 1920', () => {
      expect(isMobile(1920)).toBe(false);
    });

    it('returns false for 2000', () => {
      expect(isMobile(2000)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns true for negative width', () => {
      expect(isMobile(-1)).toBe(true);
    });

    it('returns false for NaN (NaN < 1024 is false)', () => {
      expect(isMobile(NaN)).toBe(false);
    });

    it('returns false for Infinity', () => {
      expect(isMobile(Infinity)).toBe(false);
    });
  });
});
