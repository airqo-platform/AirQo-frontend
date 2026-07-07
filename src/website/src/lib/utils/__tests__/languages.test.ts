import { getFlagUrl, Language, languages } from '../languages';

describe('languages', () => {
  describe('getFlagUrl', () => {
    it('returns correct flag URL format', () => {
      expect(getFlagUrl('gb')).toBe('https://flagcdn.com/w80/gb.png');
    });

    it('lowercases country code', () => {
      expect(getFlagUrl('US')).toBe('https://flagcdn.com/w80/us.png');
    });

    it('handles already lowercase code', () => {
      expect(getFlagUrl('fr')).toBe('https://flagcdn.com/w80/fr.png');
    });
  });

  describe('languages array', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    });

    it('contains expected languages', () => {
      const codes = languages.map((l) => l.code);
      expect(codes).toContain('en-GB');
      expect(codes).toContain('fr');
      expect(codes).toContain('sw');
      expect(codes).toContain('ar');
      expect(codes).toContain('ha');
    });

    it('all languages have required fields', () => {
      languages.forEach((lang: Language) => {
        expect(typeof lang.code).toBe('string');
        expect(lang.code.length).toBeGreaterThan(0);
        expect(typeof lang.name).toBe('string');
        expect(lang.name.length).toBeGreaterThan(0);
        expect(typeof lang.flag).toBe('string');
        expect(lang.flag.length).toBeGreaterThan(0);
        expect(typeof lang.country).toBe('string');
        expect(lang.country.length).toBeGreaterThan(0);
        expect(typeof lang.region).toBe('string');
        expect(lang.region.length).toBeGreaterThan(0);
      });
    });

    it('has no duplicate language codes', () => {
      const codes = languages.map((l) => l.code);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('has languages with valid region values', () => {
      const validRegions = [
        'International Priority',
        'East Africa',
        'West Africa',
        'Southern Africa',
        'North Africa',
      ];
      languages.forEach((lang) => {
        expect(validRegions).toContain(lang.region);
      });
    });

    it('has offlineSupport as optional boolean', () => {
      languages.forEach((lang) => {
        if (lang.offlineSupport !== undefined) {
          expect(typeof lang.offlineSupport).toBe('boolean');
        }
      });
    });

    it('Arabic has offlineSupport', () => {
      const arabic = languages.find((l) => l.code === 'ar');
      expect(arabic?.offlineSupport).toBe(true);
    });

    it('English (UK) is the first language', () => {
      expect(languages[0].code).toBe('en-GB');
    });
  });
});
