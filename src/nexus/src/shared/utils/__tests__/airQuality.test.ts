import {
  getAirQualityLevel,
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityIconForRangeKey,
  getAirQualityLevelForRangeKey,
  getAirQualityInfo,
  mapAqiCategoryToLevel,
  getPollutantLabel,
  setActiveAqiConfig,
  AQ_STANDARDS,
  REFERENCE_LINES,
  AIR_QUALITY_COLORS,
} from '../airQuality';
import type { AirQualityLevel } from '../airQuality';
import type { AqiConfig } from '@/shared/types/aqi';

const TEST_AQI_CONFIG: AqiConfig = {
  pollutant: 'pm2_5',
  standard: 'test',
  source: 'test',
  version: null,
  effective_from: null,
  ranges: [
    ['good', 'Good', 9.1, '#34C759'],
    ['moderate', 'Moderate', 35.49, '#ECAA06'],
    ['u4sg', 'Unhealthy for Sensitive Groups', 55.49, '#FF851F'],
    ['unhealthy', 'Unhealthy', 125.49, '#F7453C'],
    ['very_unhealthy', 'Very Unhealthy', 225.49, '#AC5CD9'],
    ['hazardous', 'Hazardous', null, '#D95BA3'],
  ].map(([key, label, max_value, color], index) => ({
    key: key as AqiConfig['ranges'][number]['key'],
    label: label as string,
    min_value: [0, 9.101, 35.491, 55.491, 125.491, 225.491][index],
    max_value: max_value as number | null,
    color: color as string,
    display_order: index + 1,
  })),
};

const TEST_PM10_AQI_CONFIG: AqiConfig = {
  ...TEST_AQI_CONFIG,
  pollutant: 'pm10',
  ranges: [
    ['good', 'Good', 54, '#34C759'],
    ['moderate', 'Moderate', 154, '#ECAA06'],
    ['u4sg', 'Unhealthy for Sensitive Groups', 254, '#FF851F'],
    ['unhealthy', 'Unhealthy', 354, '#F7453C'],
    ['very_unhealthy', 'Very Unhealthy', 424, '#AC5CD9'],
    ['hazardous', 'Hazardous', null, '#D95BA3'],
  ].map(([key, label, max_value, color], index) => ({
    key: key as AqiConfig['ranges'][number]['key'],
    label: label as string,
    min_value: [0, 55, 155, 255, 355, 425][index],
    max_value: max_value as number | null,
    color: color as string,
    display_order: index + 1,
  })),
};

beforeAll(() => {
  setActiveAqiConfig(TEST_AQI_CONFIG);
  setActiveAqiConfig(TEST_PM10_AQI_CONFIG);
});

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

    it('uses the configured unbounded hazardous range', () => {
      expect(getAirQualityLevel(501, 'pm2_5')).toBe('hazardous');
    });

    it('uses pollutant-specific configured ranges', () => {
      expect(getAirQualityLevel(0, 'pm10')).toBe('good');
      expect(getAirQualityLevel(30, 'pm10')).toBe('good');
      expect(getAirQualityLevel(60, 'pm10')).toBe('moderate');
      expect(getAirQualityLevel(30, 'pm2_5')).toBe('moderate');
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

  describe('AQI range icon mapping', () => {
    it('maps every API range key to its matching AQI icon level', () => {
      const expected = {
        good: 'good',
        moderate: 'moderate',
        u4sg: 'unhealthy-sensitive-groups',
        unhealthy: 'unhealthy',
        very_unhealthy: 'very-unhealthy',
        hazardous: 'hazardous',
      } as const;

      Object.entries(expected).forEach(([key, level]) => {
        expect(
          getAirQualityLevelForRangeKey(key as keyof typeof expected)
        ).toBe(level);
        expect(getAirQualityIconForRangeKey(key as keyof typeof expected)).toBe(
          getAirQualityIcon(level)
        );
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

  describe('dynamic AQI configuration', () => {
    it('uses API-provided labels and colors', () => {
      expect(getAirQualityInfo(10).label).toBe('Moderate');
      expect(getAirQualityColor('hazardous')).toBe('#D95BA3');
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
