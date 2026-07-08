import type { AirQualityLevel } from '../airQuality';
import {
  AIR_QUALITY_COLORS,
  categoryToLevel,
  formatName,
  getAirQualityCategory,
  getAirQualityColor,
  POLLUTANT_RANGES,
} from '../airQuality';

describe('getAirQualityCategory', () => {
  describe('PM2.5 pollutant', () => {
    it('should return Good for low PM2.5 values', () => {
      expect(getAirQualityCategory(0, 'pm2_5')).toBe('Good');
      expect(getAirQualityCategory(5, 'pm2_5')).toBe('Good');
    });

    it('should return Good just below Moderate threshold', () => {
      expect(getAirQualityCategory(9.0, 'pm2_5')).toBe('Good');
    });

    it('should return Moderate at threshold', () => {
      expect(getAirQualityCategory(9.1, 'pm2_5')).toBe('Moderate');
    });

    it('should return Moderate for moderate PM2.5 values', () => {
      expect(getAirQualityCategory(10, 'pm2_5')).toBe('Moderate');
      expect(getAirQualityCategory(30, 'pm2_5')).toBe('Moderate');
    });

    it('should return Moderate just below UnhealthyForSensitiveGroups threshold', () => {
      expect(getAirQualityCategory(35.4, 'pm2_5')).toBe('Moderate');
    });

    it('should return UnhealthyForSensitiveGroups at threshold', () => {
      expect(getAirQualityCategory(35.5, 'pm2_5')).toBe(
        'UnhealthyForSensitiveGroups',
      );
    });

    it('should return UnhealthyForSensitiveGroups', () => {
      expect(getAirQualityCategory(36, 'pm2_5')).toBe(
        'UnhealthyForSensitiveGroups',
      );
      expect(getAirQualityCategory(50, 'pm2_5')).toBe(
        'UnhealthyForSensitiveGroups',
      );
    });

    it('should return Unhealthy', () => {
      expect(getAirQualityCategory(56, 'pm2_5')).toBe('Unhealthy');
      expect(getAirQualityCategory(100, 'pm2_5')).toBe('Unhealthy');
    });

    it('should return VeryUnhealthy', () => {
      expect(getAirQualityCategory(126, 'pm2_5')).toBe('VeryUnhealthy');
      expect(getAirQualityCategory(200, 'pm2_5')).toBe('VeryUnhealthy');
    });

    it('should return Hazardous', () => {
      expect(getAirQualityCategory(226, 'pm2_5')).toBe('Hazardous');
      expect(getAirQualityCategory(500, 'pm2_5')).toBe('Hazardous');
    });

    it('should return Unknown for values above highest limit', () => {
      expect(getAirQualityCategory(501, 'pm2_5')).toBe('Unknown');
    });
  });

  describe('PM10 pollutant', () => {
    it('should return Good for low PM10 values', () => {
      expect(getAirQualityCategory(0, 'pm10')).toBe('Good');
      expect(getAirQualityCategory(50, 'pm10')).toBe('Good');
    });

    it('should return Good just below Moderate threshold', () => {
      expect(getAirQualityCategory(54.0, 'pm10')).toBe('Good');
    });

    it('should return Moderate at threshold', () => {
      expect(getAirQualityCategory(54.1, 'pm10')).toBe('Moderate');
    });

    it('should return Moderate for moderate PM10 values', () => {
      expect(getAirQualityCategory(55, 'pm10')).toBe('Moderate');
      expect(getAirQualityCategory(100, 'pm10')).toBe('Moderate');
    });

    it('should return UnhealthyForSensitiveGroups', () => {
      expect(getAirQualityCategory(155, 'pm10')).toBe(
        'UnhealthyForSensitiveGroups',
      );
      expect(getAirQualityCategory(200, 'pm10')).toBe(
        'UnhealthyForSensitiveGroups',
      );
    });

    it('should return Unhealthy', () => {
      expect(getAirQualityCategory(255, 'pm10')).toBe('Unhealthy');
      expect(getAirQualityCategory(300, 'pm10')).toBe('Unhealthy');
    });

    it('should return VeryUnhealthy', () => {
      expect(getAirQualityCategory(355, 'pm10')).toBe('VeryUnhealthy');
      expect(getAirQualityCategory(400, 'pm10')).toBe('VeryUnhealthy');
    });

    it('should return Hazardous', () => {
      expect(getAirQualityCategory(425, 'pm10')).toBe('Hazardous');
      expect(getAirQualityCategory(600, 'pm10')).toBe('Hazardous');
    });

    it('should return Unknown for values above highest limit', () => {
      expect(getAirQualityCategory(605, 'pm10')).toBe('Unknown');
    });
  });

  describe('edge cases', () => {
    it('should return Unknown for null value', () => {
      expect(getAirQualityCategory(null, 'pm2_5')).toBe('Unknown');
    });

    it('should return Unknown for undefined value', () => {
      expect(getAirQualityCategory(undefined, 'pm2_5')).toBe('Unknown');
    });

    it('should return Unknown for negative values', () => {
      expect(getAirQualityCategory(-1, 'pm2_5')).toBe('Unknown');
      expect(getAirQualityCategory(-100, 'pm10')).toBe('Unknown');
    });

    it('should return Unknown for zero', () => {
      expect(getAirQualityCategory(0, 'pm2_5')).toBe('Good');
    });
  });
});

describe('categoryToLevel', () => {
  it('should convert Good to good', () => {
    expect(categoryToLevel('Good')).toBe('good');
  });

  it('should convert Moderate to moderate', () => {
    expect(categoryToLevel('Moderate')).toBe('moderate');
  });

  it('should convert UnhealthyForSensitiveGroups to unhealthy-sensitive-groups', () => {
    expect(categoryToLevel('UnhealthyForSensitiveGroups')).toBe(
      'unhealthy-sensitive-groups',
    );
  });

  it('should convert Unhealthy to unhealthy', () => {
    expect(categoryToLevel('Unhealthy')).toBe('unhealthy');
  });

  it('should convert VeryUnhealthy to very-unhealthy', () => {
    expect(categoryToLevel('VeryUnhealthy')).toBe('very-unhealthy');
  });

  it('should convert Hazardous to hazardous', () => {
    expect(categoryToLevel('Hazardous')).toBe('hazardous');
  });

  it('should handle lowercase input', () => {
    expect(categoryToLevel('good')).toBe('good');
    expect(categoryToLevel('moderate')).toBe('moderate');
  });

  it('should handle input with spaces', () => {
    expect(categoryToLevel('Unhealthy For Sensitive Groups')).toBe(
      'unhealthy-sensitive-groups',
    );
  });

  it('should return no-value for unknown categories', () => {
    expect(categoryToLevel('Unknown')).toBe('no-value');
    expect(categoryToLevel('RandomCategory')).toBe('no-value');
  });

  it('should handle empty string', () => {
    expect(categoryToLevel('')).toBe('no-value');
  });
});

describe('getAirQualityColor', () => {
  it('should return correct color for Good', () => {
    expect(getAirQualityColor('Good')).toBe(AIR_QUALITY_COLORS.good);
  });

  it('should return correct color for Moderate', () => {
    expect(getAirQualityColor('Moderate')).toBe(AIR_QUALITY_COLORS.moderate);
  });

  it('should return correct color for UnhealthyForSensitiveGroups', () => {
    expect(getAirQualityColor('UnhealthyForSensitiveGroups')).toBe(
      AIR_QUALITY_COLORS['unhealthy-sensitive-groups'],
    );
  });

  it('should return correct color for Unhealthy', () => {
    expect(getAirQualityColor('Unhealthy')).toBe(AIR_QUALITY_COLORS.unhealthy);
  });

  it('should return correct color for VeryUnhealthy', () => {
    expect(getAirQualityColor('VeryUnhealthy')).toBe(
      AIR_QUALITY_COLORS['very-unhealthy'],
    );
  });

  it('should return correct color for Hazardous', () => {
    expect(getAirQualityColor('Hazardous')).toBe(AIR_QUALITY_COLORS.hazardous);
  });

  it('should return no-value color for unknown category', () => {
    expect(getAirQualityColor('Unknown')).toBe(AIR_QUALITY_COLORS['no-value']);
  });

  it('should handle lowercase input', () => {
    expect(getAirQualityColor('good')).toBe(AIR_QUALITY_COLORS.good);
  });
});

describe('formatName', () => {
  it('should capitalize first letter of each word', () => {
    expect(formatName('hello')).toBe('Hello');
  });

  it('should replace underscores with spaces', () => {
    expect(formatName('hello_world')).toBe('Hello World');
  });

  it('should replace hyphens with spaces', () => {
    expect(formatName('hello-world')).toBe('Hello World');
  });

  it('should handle mixed separators', () => {
    expect(formatName('hello_world-foo')).toBe('Hello World Foo');
  });

  it('should handle single character', () => {
    expect(formatName('a')).toBe('A');
  });

  it('should handle empty string', () => {
    expect(formatName('')).toBe('');
  });

  it('should handle already capitalized', () => {
    expect(formatName('Hello_World')).toBe('Hello World');
  });

  it('should handle numbers', () => {
    expect(formatName('hello_123')).toBe('Hello 123');
  });

  it('should handle multiple underscores', () => {
    expect(formatName('hello__world')).toBe('Hello  World');
  });

  it('should handle lowercase input', () => {
    expect(formatName('this_is_a_test')).toBe('This Is A Test');
  });
});

describe('constants', () => {
  it('should have all AIR_QUALITY_COLORS defined', () => {
    const expectedKeys: AirQualityLevel[] = [
      'good',
      'moderate',
      'unhealthy-sensitive-groups',
      'unhealthy',
      'very-unhealthy',
      'hazardous',
      'no-value',
    ];
    expectedKeys.forEach((key) => {
      expect(AIR_QUALITY_COLORS[key]).toBeDefined();
      expect(typeof AIR_QUALITY_COLORS[key]).toBe('string');
    });
  });

  it('should have POLLUTANT_RANGES for pm2_5 and pm10', () => {
    expect(POLLUTANT_RANGES.pm2_5).toBeDefined();
    expect(POLLUTANT_RANGES.pm10).toBeDefined();
    expect(POLLUTANT_RANGES.pm2_5.length).toBeGreaterThan(0);
    expect(POLLUTANT_RANGES.pm10.length).toBeGreaterThan(0);
  });

  it('should have sorted ranges in descending order for pm2_5', () => {
    const limits = POLLUTANT_RANGES.pm2_5.map((r) => r.limit);
    for (let i = 1; i < limits.length; i++) {
      expect(limits[i - 1]).toBeGreaterThanOrEqual(limits[i]);
    }
  });

  it('should have sorted ranges in descending order for pm10', () => {
    const limits = POLLUTANT_RANGES.pm10.map((r) => r.limit);
    for (let i = 1; i < limits.length; i++) {
      expect(limits[i - 1]).toBeGreaterThanOrEqual(limits[i]);
    }
  });
});
