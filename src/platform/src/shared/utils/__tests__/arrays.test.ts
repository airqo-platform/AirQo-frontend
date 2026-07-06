import { areArraysEqual } from '../arrays';

describe('areArraysEqual', () => {
  describe('same reference', () => {
    it('returns true when both args reference the same array', () => {
      const arr = [1, 2, 3];
      expect(areArraysEqual(arr, arr)).toBe(true);
    });
  });

  describe('equal arrays', () => {
    it('returns true for identical content', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns true for single-element arrays with same value', () => {
      expect(areArraysEqual([42], [42])).toBe(true);
    });
  });

  describe('different lengths', () => {
    it('returns false when left is shorter', () => {
      expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false when right is shorter', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2])).toBe(false);
    });
  });

  describe('different elements', () => {
    it('returns false when elements differ', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('returns false for single-element arrays with different values', () => {
      expect(areArraysEqual([1], [2])).toBe(false);
    });
  });

  describe('empty arrays', () => {
    it('returns true for two empty arrays', () => {
      expect(areArraysEqual([], [])).toBe(true);
    });
  });

  describe('no-args defaults', () => {
    it('treats no arguments as empty arrays', () => {
      expect(areArraysEqual()).toBe(true);
    });

    it('treats undefined as empty', () => {
      expect(areArraysEqual(undefined, undefined)).toBe(true);
    });

    it('returns false when left is defined and right is undefined', () => {
      expect(areArraysEqual([1], undefined)).toBe(false);
    });

    it('returns false when left is undefined and right is defined', () => {
      expect(areArraysEqual(undefined, [1])).toBe(false);
    });
  });

  describe('NaN handling (Object.is semantics)', () => {
    it('returns true for [NaN] vs [NaN] because Object.is(NaN, NaN) is true', () => {
      expect(areArraysEqual([NaN], [NaN])).toBe(true);
    });
  });

  describe('-0 vs +0 (Object.is semantics)', () => {
    it('returns false for [-0] vs [+0] because Object.is(-0, +0) is false', () => {
      expect(areArraysEqual([-0], [+0])).toBe(false);
    });
  });

  describe('object reference equality', () => {
    it('returns false for [{a:1}] vs [{a:1}] because references differ', () => {
      expect(areArraysEqual([{ a: 1 }], [{ a: 1 }])).toBe(false);
    });

    it('returns true when the same object reference is in both arrays', () => {
      const obj = { a: 1 };
      expect(areArraysEqual([obj], [obj])).toBe(true);
    });
  });

  describe('undefined and null elements', () => {
    it('returns true for [undefined] vs [undefined]', () => {
      expect(areArraysEqual([undefined], [undefined])).toBe(true);
    });

    it('returns true for [null] vs [null]', () => {
      expect(areArraysEqual([null], [null])).toBe(true);
    });

    it('returns false for [undefined] vs [null]', () => {
      expect(areArraysEqual([undefined], [null])).toBe(false);
    });

    it('returns true for mixed null/undefined arrays that match', () => {
      expect(areArraysEqual([null, undefined], [null, undefined])).toBe(true);
    });
  });
});
