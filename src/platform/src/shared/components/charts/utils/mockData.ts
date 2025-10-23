import { AirQualityDataPoint, NormalizedChartData } from '../types';

/**
 * Generate mock air quality data for testing and showcase purposes
 * @param siteCount Number of monitoring sites to generate data for
 * @param dataPoints Number of data points per site
 * @returns Array of normalized chart data
 */
export const generateMockAirQualityData = (
  siteCount: number = 1,
  dataPoints: number = 24
): NormalizedChartData[] => {
  const sites = [
    'Kampala Central',
    'Bukoto Industrial',
    'Makerere University',
    'Ntinda Residential',
    'Wandegeya Market',
  ];

  const data: NormalizedChartData[] = [];
  const now = new Date();

  for (let siteIndex = 0; siteIndex < siteCount; siteIndex++) {
    const siteName = sites[siteIndex] || `Site ${siteIndex + 1}`;
    const siteId = `site_${siteIndex + 1}`;
    const deviceId = `device_${siteIndex + 1}_001`;

    // Generate baseline pollution level based on site type
    let baselineMin = 10;
    let baselineMax = 30;

    if (siteName.includes('Industrial')) {
      baselineMin = 25;
      baselineMax = 55;
    } else if (siteName.includes('Market')) {
      baselineMin = 20;
      baselineMax = 45;
    } else if (
      siteName.includes('University') ||
      siteName.includes('Residential')
    ) {
      baselineMin = 8;
      baselineMax = 25;
    }

    for (let i = 0; i < dataPoints; i++) {
      // Create time points going backwards from now
      const timePoint = new Date(
        now.getTime() - (dataPoints - 1 - i) * 60 * 60 * 1000
      );

      // Add daily and weekly patterns
      const hourOfDay = timePoint.getHours();
      const dayOfWeek = timePoint.getDay();

      // Morning and evening rush hour peaks
      let hourMultiplier = 1;
      if (hourOfDay >= 7 && hourOfDay <= 9) {
        hourMultiplier = 1.3; // Morning rush
      } else if (hourOfDay >= 17 && hourOfDay <= 19) {
        hourMultiplier = 1.4; // Evening rush
      } else if (hourOfDay >= 22 || hourOfDay <= 5) {
        hourMultiplier = 0.7; // Night time
      }

      // Weekend vs weekday pattern
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1;

      // Generate value with some randomness
      const baseValue =
        baselineMin + Math.random() * (baselineMax - baselineMin);
      const seasonalVariation =
        1 + 0.2 * Math.sin((timePoint.getMonth() / 12) * 2 * Math.PI);
      const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation

      const value = Math.max(
        0,
        baseValue *
          hourMultiplier *
          weekendMultiplier *
          seasonalVariation *
          randomVariation
      );

      data.push({
        time: timePoint.toISOString(),
        value: Math.round(value * 100) / 100, // Round to 2 decimal places
        site: siteName,
        site_id: siteId,
        device_id: deviceId,
        rawTime: timePoint.toISOString(),
        count: 1,
        // Dynamic site key for multi-series charts
        [siteName]: Math.round(value * 100) / 100,
      });
    }
  }

  return data;
};

/**
 * Generate raw air quality data points (original API format)
 */
export const generateMockRawAirQualityData = (
  siteCount: number = 1,
  dataPoints: number = 24
): AirQualityDataPoint[] => {
  const sites = [
    { name: 'Kampala Central', id: 'kampala_central' },
    { name: 'Bukoto Industrial', id: 'bukoto_industrial' },
    { name: 'Makerere University', id: 'makerere_university' },
  ];

  const data: AirQualityDataPoint[] = [];
  const now = new Date();

  for (let siteIndex = 0; siteIndex < siteCount; siteIndex++) {
    const site = sites[siteIndex] || {
      name: `Site ${siteIndex + 1}`,
      id: `site_${siteIndex + 1}`,
    };

    for (let i = 0; i < dataPoints; i++) {
      const timePoint = new Date(
        now.getTime() - (dataPoints - 1 - i) * 60 * 60 * 1000
      );
      const value = 5 + Math.random() * 50; // PM2.5 values between 5-55 µg/m³

      data.push({
        site_id: site.id,
        value: Math.round(value * 100) / 100,
        time: timePoint.toISOString(),
        generated_name: site.name,
        device_id: `${site.id}_device_001`,
        name: site.name,
      });
    }
  }

  return data;
};

/**
 * Generate data for specific chart type testing
 */
export const generateChartTypeTestData = (chartType: string) => {
  switch (chartType) {
    case 'pie':
      return [
        { time: 'Good (0-12)', value: 45, site: 'Distribution', count: 45 },
        {
          time: 'Moderate (12-35)',
          value: 30,
          site: 'Distribution',
          count: 30,
        },
        { time: 'Unhealthy (35+)', value: 25, site: 'Distribution', count: 25 },
      ];

    case 'radar':
      return [
        { time: 'PM2.5', value: 25, site: 'Kampala', Kampala: 25, Bukoto: 35 },
        { time: 'PM10', value: 45, site: 'Kampala', Kampala: 45, Bukoto: 55 },
      ];

    default:
      return generateMockAirQualityData(2, 20);
  }
};

/**
 * Add realistic seasonal and diurnal patterns to mock data
 */
export const addRealisticPatterns = (
  data: NormalizedChartData[]
): NormalizedChartData[] => {
  return data.map(point => {
    const date = new Date(point.time);
    const hour = date.getHours();
    const month = date.getMonth();

    // Diurnal pattern (higher during day, lower at night)
    const diurnalMultiplier =
      0.7 + 0.6 * (0.5 + 0.5 * Math.sin(((hour - 6) * Math.PI) / 12));

    // Seasonal pattern (higher in dry season)
    const seasonalMultiplier = 1 + 0.3 * Math.sin(((month - 2) * Math.PI) / 6);

    return {
      ...point,
      value: point.value * diurnalMultiplier * seasonalMultiplier,
    };
  });
};
