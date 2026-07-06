import { normalizeCohortIds } from '../cohortUtils';

describe('normalizeCohortIds', () => {
  describe('null and undefined', () => {
    it('returns empty array for null', () => {
      expect(normalizeCohortIds(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(normalizeCohortIds(undefined)).toEqual([]);
    });
  });

  describe('comma-separated strings', () => {
    it('splits comma-separated string', () => {
      expect(normalizeCohortIds('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace around values', () => {
      expect(normalizeCohortIds(' a , b , c ')).toEqual(['a', 'b', 'c']);
    });

    it('filters empty segments', () => {
      expect(normalizeCohortIds('a,,b,')).toEqual(['a', 'b']);
    });
  });

  describe('number input', () => {
    it('converts 42 to ["42"]', () => {
      expect(normalizeCohortIds(42)).toEqual(['42']);
    });

    it('converts 0 to ["0"]', () => {
      expect(normalizeCohortIds(0)).toEqual(['0']);
    });
  });

  describe('object with ID fields', () => {
    it('extracts _id', () => {
      expect(normalizeCohortIds({ _id: 'id-1' })).toEqual(['id-1']);
    });

    it('extracts id', () => {
      expect(normalizeCohortIds({ id: 'id-2' })).toEqual(['id-2']);
    });

    it('extracts cohort_id', () => {
      expect(normalizeCohortIds({ cohort_id: 'id-3' })).toEqual(['id-3']);
    });

    it('extracts cohortId', () => {
      expect(normalizeCohortIds({ cohortId: 'id-4' })).toEqual(['id-4']);
    });

    it('_id takes priority over id, cohort_id, cohortId', () => {
      expect(
        normalizeCohortIds({
          _id: 'first',
          id: 'second',
          cohort_id: 'third',
          cohortId: 'fourth',
        })
      ).toEqual(['first']);
    });

    it('returns empty array for object with no ID fields', () => {
      expect(normalizeCohortIds({ name: 'test' })).toEqual([]);
    });

    it('returns empty array for empty object', () => {
      expect(normalizeCohortIds({})).toEqual([]);
    });
  });

  describe('nested arrays', () => {
    it('flattens nested arrays', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(normalizeCohortIds(['a', ['b', 'c']] as any)).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('flattens deeply nested arrays', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(normalizeCohortIds(['a', ['b', ['c']]] as any)).toEqual([
        'a',
        'b',
        'c',
      ]);
    });
  });

  describe('deduplication', () => {
    it('deduplicates identical values', () => {
      expect(normalizeCohortIds(['a', 'a', 'b'])).toEqual(['a', 'b']);
    });

    it('deduplicates after trimming whitespace', () => {
      expect(normalizeCohortIds([' a', 'a '])).toEqual(['a']);
    });
  });

  describe('empty string filtering', () => {
    it('filters out empty strings from arrays', () => {
      expect(normalizeCohortIds(['a', '', 'b'])).toEqual(['a', 'b']);
    });

    it('filters out empty strings from comma-separated input', () => {
      expect(normalizeCohortIds('a,,b,')).toEqual(['a', 'b']);
    });
  });

  describe('boolean input', () => {
    it('returns empty array for boolean true', () => {
      expect(normalizeCohortIds(true as unknown as null)).toEqual([]);
    });

    it('returns empty array for boolean false', () => {
      expect(normalizeCohortIds(false as unknown as null)).toEqual([]);
    });
  });

  describe('mixed arrays with nulls', () => {
    it('filters nulls from mixed arrays', () => {
      expect(normalizeCohortIds(['a', null, 'b'])).toEqual(['a', 'b']);
    });

    it('filters undefined from mixed arrays', () => {
      expect(normalizeCohortIds(['a', undefined, 'b'])).toEqual(['a', 'b']);
    });
  });
});
