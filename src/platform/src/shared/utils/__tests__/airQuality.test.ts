import {
  getAirQualityLevel,
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityInfo,
  mapAqiCategoryToLevel,
  getPollutantLabel,
  POLLUTANT_RANGES,
  AQ_STANDARDS,
  REFERENCE_LINES,
  AIR_QUALITY_COLORS,
} from '../airQuality';
import type { AirQualityLevel } from '../airQuality';

describe('airQuality', () => {
  describe('getAirQualityLevel', () => {
    it('returns no-value for null', () => {
      expect(getAirQualityLevel(null)).toBe('no-value');
    });

    it('returns no-value for undefined', () => {
      expect(getAirQualityLevel(undefined)).toBe('no-value');
    });

    it('returns no-value for NaN', () => {
      expect(getAirQualityLevel(NaN)).toBe('no-value');
    });

    it('returns good for pm2_5=0', () => {
      expect(getAirQualityLevel(0, 'pm2_5')).toBe('good');
    });

    it('returns good for pm2_5=5', () => {
      expect(getAirQualityLevel(5, 'pm2_5')).toBe('good');
    });

    it('returns moderate for pm2_5=10', () => {
      expect(getAirQualityLevel(10, 'pm2_5')).toBe('moderate');
    });

    it('returns unhealthy-sensitive-groups for pm2_5=40', () => {
      expect(getAirQualityLevel(40, 'pm2_5')).toBe(
        'unhealthy-sensitive-groups'
      );
    });

    it('returns unhealthy for pm2_5=60', () => {
      expect(getAirQualityLevel(60, 'pm2_5')).toBe('unhealthy');
    });

    it('returns very-unhealthy for pm2_5=130', () => {
      expect(getAirQualityLevel(130, 'pm2_5')).toBe('very-unhealthy');
    });

    it('returns hazardous for pm2_5=230', () => {
      expect(getAirQualityLevel(230, 'pm2_5')).toBe('hazardous');
    });

    it('returns no-value for invalid (over 500.5) pm2_5', () => {
      expect(getAirQualityLevel(501, 'pm2_5')).toBe('no-value');
    });

    it('works for pm10 with different thresholds', () => {
      expect(getAirQualityLevel(0, 'pm10')).toBe('good');
      expect(getAirQualityLevel(30, 'pm10')).toBe('good');
      expect(getAirQualityLevel(60, 'pm10')).toBe('moderate');
      expect(getAirQualityLevel(160, 'pm10')).toBe(
        'unhealthy-sensitive-groups'
      );
      expect(getAirQualityLevel(260, 'pm10')).toBe('unhealthy');
      expect(getAirQualityLevel(360, 'pm10')).toBe('very-unhealthy');
      expect(getAirQualityLevel(430, 'pm10')).toBe('hazardous');
    });

    it('defaults to pm2_5 when pollutant is not specified', () => {
      expect(getAirQualityLevel(5)).toBe('good');
    });
  });

  describe('getAirQualityColor', () => {
    it('returns hex color string for good', () => {
      const color = getAirQualityColor('good');
      expect(color).toBe(AIR_QUALITY_COLORS.good);
    });

    it('returns hex color string for moderate', () => {
      const color = getAirQualityColor('moderate');
      expect(color).toBe(AIR_QUALITY_COLORS.moderate);
    });

    it('returns hex color string for unhealthy', () => {
      const color = getAirQualityColor('unhealthy');
      expect(color).toBe(AIR_QUALITY_COLORS.unhealthy);
    });

    it('returns hex color string for hazardous', () => {
      const color = getAirQualityColor('hazardous');
      expect(color).toBe(AIR_QUALITY_COLORS.hazardous);
    });

    it('returns gray for no-value', () => {
      const color = getAirQualityColor('no-value');
      expect(color).toBe('#6B7280');
    });
  });

  describe('getAirQualityIcon', () => {
    it('returns a defined value for each level', () => {
      const levels: AirQualityLevel[] = [
        'good',
        'moderate',
        'unhealthy-sensitive-groups',
        'unhealthy',
        'very-unhealthy',
        'hazardous',
        'no-value',
      ];

      levels.forEach(level => {
        const iconComponent = getAirQualityIcon(level);
        expect(iconComponent).toBeDefined();
      });
    });
  });

  describe('getAirQualityInfo', () => {
    it('returns object with level, label, icon, description', () => {
      const info = getAirQualityInfo(5);
      expect(info).toHaveProperty('level');
      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('icon');
      expect(info).toHaveProperty('description');
    });

    it('works with default parameters', () => {
      const info = getAirQualityInfo(10);
      expect(info.level).toBe('moderate');
      expect(typeof info.label).toBe('string');
      expect(info.icon).toBeDefined();
    });

    it('returns no-value level for null input', () => {
      const info = getAirQualityInfo(null);
      expect(info.level).toBe('no-value');
    });
  });

  describe('mapAqiCategoryToLevel', () => {
    it('maps good to good', () => {
      expect(mapAqiCategoryToLevel('good')).toBe('good');
    });

    it('maps GoodAir to good', () => {
      expect(mapAqiCategoryToLevel('GoodAir')).toBe('good');
    });

    it('maps moderate to moderate', () => {
      expect(mapAqiCategoryToLevel('moderate')).toBe('moderate');
    });

    it('maps ModerateAir to moderate', () => {
      expect(mapAqiCategoryToLevel('ModerateAir')).toBe('moderate');
    });

    it('maps UnhealthyForSensitiveGroups to unhealthy-sensitive-groups', () => {
      expect(mapAqiCategoryToLevel('UnhealthyForSensitiveGroups')).toBe(
        'unhealthy-sensitive-groups'
      );
    });

    it('maps Unhealthy to unhealthy', () => {
      expect(mapAqiCategoryToLevel('Unhealthy')).toBe('unhealthy');
    });

    it('maps VeryUnhealthy to very-unhealthy', () => {
      expect(mapAqiCategoryToLevel('VeryUnhealthy')).toBe('very-unhealthy');
    });

    it('maps Hazardous to hazardous', () => {
      expect(mapAqiCategoryToLevel('Hazardous')).toBe('hazardous');
    });

    it('maps Invalid to no-value', () => {
      expect(mapAqiCategoryToLevel('Invalid')).toBe('no-value');
    });

    it('returns no-value for undefined', () => {
      expect(mapAqiCategoryToLevel(undefined)).toBe('no-value');
    });

    it('returns no-value for null', () => {
      expect(mapAqiCategoryToLevel(null as unknown as string)).toBe('no-value');
    });

    it('returns no-value for unknown category', () => {
      expect(mapAqiCategoryToLevel('UnknownCategory')).toBe('no-value');
    });
  });

  describe('getPollutantLabel', () => {
    it('returns PM₂.₅ for pm2_5', () => {
      expect(getPollutantLabel('pm2_5')).toBe('PM₂.₅');
    });

    it('returns PM₁₀ for pm10', () => {
      expect(getPollutantLabel('pm10')).toBe('PM₁₀');
    });
  });

  describe('POLLUTANT_RANGES', () => {
    it('pm2_5 has entries', () => {
      expect(POLLUTANT_RANGES.pm2_5).toBeDefined();
      expect(Array.isArray(POLLUTANT_RANGES.pm2_5)).toBe(true);
      expect(POLLUTANT_RANGES.pm2_5.length).toBeGreaterThan(0);
    });

    it('pm10 has entries', () => {
      expect(POLLUTANT_RANGES.pm10).toBeDefined();
      expect(Array.isArray(POLLUTANT_RANGES.pm10)).toBe(true);
      expect(POLLUTANT_RANGES.pm10.length).toBeGreaterThan(0);
    });

    it('each entry has limit and category', () => {
      [...POLLUTANT_RANGES.pm2_5, ...POLLUTANT_RANGES.pm10].forEach(entry => {
        expect(entry).toHaveProperty('limit');
        expect(entry).toHaveProperty('category');
        expect(typeof entry.limit).toBe('number');
        expect(typeof entry.category).toBe('string');
      });
    });
  });

  describe('AQ_STANDARDS', () => {
    it('WHO has pm2_5 and pm10', () => {
      expect(AQ_STANDARDS.WHO).toHaveProperty('pm2_5');
      expect(AQ_STANDARDS.WHO).toHaveProperty('pm10');
      expect(typeof AQ_STANDARDS.WHO.pm2_5).toBe('number');
      expect(typeof AQ_STANDARDS.WHO.pm10).toBe('number');
    });

    it('NEMA_UGANDA has pm2_5 and pm10', () => {
      expect(AQ_STANDARDS.NEMA_UGANDA).toHaveProperty('pm2_5');
      expect(AQ_STANDARDS.NEMA_UGANDA).toHaveProperty('pm10');
      expect(typeof AQ_STANDARDS.NEMA_UGANDA.pm2_5).toBe('number');
      expect(typeof AQ_STANDARDS.NEMA_UGANDA.pm10).toBe('number');
    });

    it('NEMA_KENYA has pm2_5 and pm10', () => {
      expect(AQ_STANDARDS.NEMA_KENYA).toHaveProperty('pm2_5');
      expect(AQ_STANDARDS.NEMA_KENYA).toHaveProperty('pm10');
      expect(typeof AQ_STANDARDS.NEMA_KENYA.pm2_5).toBe('number');
      expect(typeof AQ_STANDARDS.NEMA_KENYA.pm10).toBe('number');
    });
  });

  describe('REFERENCE_LINES', () => {
    it('WHO has PM25_ANNUAL, PM25_24HR, PM10_ANNUAL, PM10_24HR', () => {
      expect(REFERENCE_LINES.WHO).toHaveProperty('PM25_ANNUAL');
      expect(REFERENCE_LINES.WHO).toHaveProperty('PM25_24HR');
      expect(REFERENCE_LINES.WHO).toHaveProperty('PM10_ANNUAL');
      expect(REFERENCE_LINES.WHO).toHaveProperty('PM10_24HR');
    });

    it('NEMA_UGANDA has same keys as WHO', () => {
      expect(REFERENCE_LINES.NEMA_UGANDA).toHaveProperty('PM25_ANNUAL');
      expect(REFERENCE_LINES.NEMA_UGANDA).toHaveProperty('PM25_24HR');
      expect(REFERENCE_LINES.NEMA_UGANDA).toHaveProperty('PM10_ANNUAL');
      expect(REFERENCE_LINES.NEMA_UGANDA).toHaveProperty('PM10_24HR');
    });

    it('NEMA_KENYA has same keys as WHO', () => {
      expect(REFERENCE_LINES.NEMA_KENYA).toHaveProperty('PM25_ANNUAL');
      expect(REFERENCE_LINES.NEMA_KENYA).toHaveProperty('PM25_24HR');
      expect(REFERENCE_LINES.NEMA_KENYA).toHaveProperty('PM10_ANNUAL');
      expect(REFERENCE_LINES.NEMA_KENYA).toHaveProperty('PM10_24HR');
    });
  });
});
