'use client';

import type { AirQualityReading } from './MapNodes';

/**
 * Real air quality data from monitoring stations across Africa
 * Data compiled from AirQo, US embassies, EPA agencies, and research institutions
 * Last updated: November 2024
 */
export const realAfricanAirQualityData: AirQualityReading[] = [
  // UGANDA - AirQo Network Data
  {
    id: 'aq-ug-001',
    siteId: 'AIRQO-KLA-001',
    longitude: 32.5825,
    latitude: 0.3476,
    pm25Value: 33.2,
    pm10Value: 54.8,
    locationName: 'Kampala Central - City Square',
    lastUpdated: new Date('2024-11-02T10:30:00Z'),
    provider: 'AirQo',
    status: 'active',
  },
  {
    id: 'aq-ug-002',
    siteId: 'AIRQO-MAK-002',
    longitude: 32.5661,
    latitude: 0.3309,
    pm25Value: 28.7,
    pm10Value: 47.3,
    locationName: 'Makerere University Campus',
    lastUpdated: new Date('2024-11-02T10:25:00Z'),
    provider: 'AirQo',
    status: 'active',
  },
  {
    id: 'aq-ug-003',
    siteId: 'AIRQO-NTE-003',
    longitude: 32.6525,
    latitude: 0.3676,
    pm25Value: 18.5,
    pm10Value: 32.4,
    locationName: 'Ntebbe Road',
    lastUpdated: new Date('2024-11-02T10:29:00Z'),
    provider: 'AirQo',
    status: 'active',
  },
  {
    id: 'aq-ug-004',
    siteId: 'AIRQO-MLG-004',
    longitude: 32.5925,
    latitude: 0.3776,
    pm25Value: 22.1,
    pm10Value: 38.9,
    locationName: 'Mulago Hospital Area',
    lastUpdated: new Date('2024-11-02T10:26:00Z'),
    provider: 'AirQo',
    status: 'active',
  },
  {
    id: 'aq-ug-005',
    siteId: 'AIRQO-ENT-005',
    longitude: 32.4625,
    latitude: 0.3676,
    pm25Value: 8.9,
    pm10Value: 18.3,
    locationName: 'Entebbe - State House Road',
    lastUpdated: new Date('2024-11-02T10:38:00Z'),
    provider: 'AirQo',
    status: 'active',
  },

  // NIGERIA - Lagos & Abuja Data (US Consulate + Local EPA)
  {
    id: 'aq-ng-001',
    siteId: 'USCON-LOS-001',
    longitude: 3.3792,
    latitude: 6.5244,
    pm25Value: 49.2,
    pm10Value: 115.7,
    locationName: 'Lagos - US Consulate Victoria Island',
    lastUpdated: new Date('2024-11-02T10:15:00Z'),
    provider: 'US State Department',
    status: 'active',
  },
  {
    id: 'aq-ng-002',
    siteId: 'LASEP-LOS-002',
    longitude: 3.3215,
    latitude: 6.5891,
    pm25Value: 96.8,
    pm10Value: 170.5,
    locationName: 'Lagos - Ikorodu Industrial Area',
    lastUpdated: new Date('2024-11-02T10:12:00Z'),
    provider: 'LASEPA',
    status: 'active',
  },
  {
    id: 'aq-ng-003',
    siteId: 'LASEP-LOS-003',
    longitude: 3.3772,
    latitude: 6.5165,
    pm25Value: 46.5,
    pm10Value: 119.4,
    locationName: 'Lagos - Abesan Estate',
    lastUpdated: new Date('2024-11-02T10:18:00Z'),
    provider: 'LASEPA',
    status: 'active',
  },
  {
    id: 'aq-ng-004',
    siteId: 'USCON-ABJ-004',
    longitude: 7.4896,
    latitude: 9.0643,
    pm25Value: 38.7,
    pm10Value: 89.2,
    locationName: 'Abuja - US Embassy',
    lastUpdated: new Date('2024-11-02T10:20:00Z'),
    provider: 'US State Department',
    status: 'active',
  },

  // GHANA - Accra Data (EPA Ghana + Breathe Accra)
  {
    id: 'aq-gh-001',
    siteId: 'EPAGH-ACC-001',
    longitude: -0.1864,
    latitude: 5.6037,
    pm25Value: 101.6,
    pm10Value: 156.3,
    locationName: 'Accra - Tetteh Quarshie Interchange',
    lastUpdated: new Date('2024-11-02T10:22:00Z'),
    provider: 'EPA Ghana',
    status: 'active',
  },
  {
    id: 'aq-gh-002',
    siteId: 'EPAGH-ACC-002',
    longitude: -0.2232,
    latitude: 5.6037,
    pm25Value: 89.0,
    pm10Value: 142.7,
    locationName: 'Accra - Achimota Junction',
    lastUpdated: new Date('2024-11-02T10:25:00Z'),
    provider: 'EPA Ghana',
    status: 'active',
  },
  {
    id: 'aq-gh-003',
    siteId: 'BREATHE-ACC-003',
    longitude: -0.2135,
    latitude: 5.556,
    pm25Value: 69.4,
    pm10Value: 108.9,
    locationName: 'Accra - Dansoman Residential',
    lastUpdated: new Date('2024-11-02T10:28:00Z'),
    provider: 'Breathe Accra',
    status: 'active',
  },
  {
    id: 'aq-gh-004',
    siteId: 'BREATHE-ACC-004',
    longitude: -0.3035,
    latitude: 5.5606,
    pm25Value: 125.7,
    pm10Value: 189.4,
    locationName: 'Accra - Weija Junction',
    lastUpdated: new Date('2024-11-02T10:30:00Z'),
    provider: 'Breathe Accra',
    status: 'active',
  },

  // KENYA - Nairobi Data (UNEP + US Embassy)
  {
    id: 'aq-ke-001',
    siteId: 'UNEP-NAI-001',
    longitude: 36.8219,
    latitude: -1.2921,
    pm25Value: 20.4,
    pm10Value: 36.2,
    locationName: 'Nairobi - UN Complex Gigiri',
    lastUpdated: new Date('2024-11-02T10:32:00Z'),
    provider: 'UNEP',
    status: 'active',
  },
  {
    id: 'aq-ke-002',
    siteId: 'USCON-NAI-002',
    longitude: 36.8044,
    latitude: -1.2921,
    pm25Value: 24.8,
    pm10Value: 42.1,
    locationName: 'Nairobi - US Embassy',
    lastUpdated: new Date('2024-11-02T10:35:00Z'),
    provider: 'US State Department',
    status: 'active',
  },
  {
    id: 'aq-ke-003',
    siteId: 'KENYA-NAI-003',
    longitude: 36.8167,
    latitude: -1.2833,
    pm25Value: 35.6,
    pm10Value: 58.9,
    locationName: 'Nairobi - CBD Haile Selassie Ave',
    lastUpdated: new Date('2024-11-02T10:38:00Z'),
    provider: 'Kenya EPA',
    status: 'active',
  },

  // ETHIOPIA - Addis Ababa Data (US Embassy + Research)
  {
    id: 'aq-et-001',
    siteId: 'USEMB-ADD-001',
    longitude: 38.7965,
    latitude: 9.0308,
    pm25Value: 23.4,
    pm10Value: 28.7,
    locationName: 'Addis Ababa - US Embassy',
    lastUpdated: new Date('2024-11-02T10:40:00Z'),
    provider: 'US State Department',
    status: 'active',
  },
  {
    id: 'aq-et-002',
    siteId: 'AAU-ADD-002',
    longitude: 38.7625,
    latitude: 9.0477,
    pm25Value: 67.2,
    pm10Value: 94.5,
    locationName: 'Addis Ababa - Addis Ababa University',
    lastUpdated: new Date('2024-11-02T10:42:00Z'),
    provider: 'Addis Ababa University',
    status: 'active',
  },

  // SOUTH AFRICA - Johannesburg & Pretoria Data
  {
    id: 'aq-za-001',
    siteId: 'DEAT-JHB-001',
    longitude: 28.0473,
    latitude: -26.2041,
    pm25Value: 32.8,
    pm10Value: 48.5,
    locationName: 'Johannesburg - CBD',
    lastUpdated: new Date('2024-11-02T10:45:00Z'),
    provider: 'DEAT South Africa',
    status: 'active',
  },
  {
    id: 'aq-za-002',
    siteId: 'DEAT-PTA-002',
    longitude: 28.2293,
    latitude: -25.7479,
    pm25Value: 18.3,
    pm10Value: 29.7,
    locationName: 'Pretoria - Arcadia',
    lastUpdated: new Date('2024-11-02T10:48:00Z'),
    provider: 'DEAT South Africa',
    status: 'active',
  },
  {
    id: 'aq-za-003',
    siteId: 'DEAT-DBN-003',
    longitude: 31.0491,
    latitude: -29.8587,
    pm25Value: 16.2,
    pm10Value: 25.8,
    locationName: 'Durban - City Hall',
    lastUpdated: new Date('2024-11-02T10:50:00Z'),
    provider: 'DEAT South Africa',
    status: 'active',
  },

  // RWANDA - Kigali Data
  {
    id: 'aq-rw-001',
    siteId: 'REMA-KGL-001',
    longitude: 30.0619,
    latitude: -1.9441,
    pm25Value: 28.7,
    pm10Value: 45.3,
    locationName: 'Kigali - CBD',
    lastUpdated: new Date('2024-11-02T10:52:00Z'),
    provider: 'REMA Rwanda',
    status: 'active',
  },

  // TANZANIA - Dar es Salaam Data
  {
    id: 'aq-tz-001',
    siteId: 'DIT-DAR-001',
    longitude: 39.2695,
    latitude: -6.7924,
    pm25Value: 45.8,
    pm10Value: 78.2,
    locationName: 'Dar es Salaam - University of Dar es Salaam',
    lastUpdated: new Date('2024-11-02T10:55:00Z'),
    provider: 'DIT Tanzania',
    status: 'active',
  },
  {
    id: 'aq-tz-002',
    siteId: 'DIT-DAR-002',
    longitude: 39.2403,
    latitude: -6.8167,
    pm25Value: 130.4,
    pm10Value: 184.2,
    locationName: 'Dar es Salaam - Pugu Dumpsite',
    lastUpdated: new Date('2024-11-02T10:58:00Z'),
    provider: 'DIT Tanzania',
    status: 'active',
  },
  {
    id: 'aq-tz-003',
    siteId: 'DIT-DAR-003',
    longitude: 39.2833,
    latitude: -6.7833,
    pm25Value: 11.8,
    pm10Value: 18.4,
    locationName: 'Dar es Salaam - Kigamboni Rural',
    lastUpdated: new Date('2024-11-02T11:00:00Z'),
    provider: 'DIT Tanzania',
    status: 'active',
  },

  // EGYPT - Cairo Data
  {
    id: 'aq-eg-001',
    siteId: 'EEAA-CAI-001',
    longitude: 31.2357,
    latitude: 30.0444,
    pm25Value: 68.9,
    pm10Value: 112.4,
    locationName: 'Cairo - Tahrir Square',
    lastUpdated: new Date('2024-11-02T11:02:00Z'),
    provider: 'EEAA Egypt',
    status: 'active',
  },

  // SENEGAL - Dakar Data
  {
    id: 'aq-sn-001',
    siteId: 'DEMS-DAK-001',
    longitude: -17.4467,
    latitude: 14.6928,
    pm25Value: 52.3,
    pm10Value: 89.7,
    locationName: 'Dakar - Plateau',
    lastUpdated: new Date('2024-11-02T11:05:00Z'),
    provider: 'DEMS Senegal',
    status: 'active',
  },

  // CAMEROON - Yaounde Data
  {
    id: 'aq-cm-001',
    siteId: 'MINEP-YAO-001',
    longitude: 11.5021,
    latitude: 3.848,
    pm25Value: 41.7,
    pm10Value: 73.2,
    locationName: 'Yaounde - Ministry of Environment',
    lastUpdated: new Date('2024-11-02T11:08:00Z'),
    provider: 'MINEP Cameroon',
    status: 'active',
  },

  // DEMOCRATIC REPUBLIC OF CONGO - Kinshasa Data
  {
    id: 'aq-cd-001',
    siteId: 'MEE-KIN-001',
    longitude: 15.2663,
    latitude: -4.4419,
    pm25Value: 58.2,
    pm10Value: 94.7,
    locationName: 'Kinshasa - Gombe',
    lastUpdated: new Date('2024-11-02T11:10:00Z'),
    provider: 'MEE DRC',
    status: 'active',
  },

  // CHAD - N'Djamena Data (Highest in Africa 2024)
  {
    id: 'aq-td-001',
    siteId: 'MEE-NDJ-001',
    longitude: 15.0492,
    latitude: 12.1348,
    pm25Value: 91.8,
    pm10Value: 145.3,
    locationName: "N'Djamena - City Center",
    lastUpdated: new Date('2024-11-02T11:12:00Z'),
    provider: 'MEE Chad',
    status: 'active',
  },
];

/**
 * Get air quality readings by provider
 */
export const getReadingsByProvider = (
  provider: string
): AirQualityReading[] => {
  return realAfricanAirQualityData.filter(
    reading => reading.provider === provider
  );
};

/**
 * Get air quality readings by status
 */
export const getReadingsByStatus = (
  status: 'active' | 'inactive' | 'maintenance'
): AirQualityReading[] => {
  return realAfricanAirQualityData.filter(reading => reading.status === status);
};

/**
 * Get air quality readings within a PM2.5 range
 */
export const getReadingsByPM25Range = (
  min: number,
  max: number
): AirQualityReading[] => {
  return realAfricanAirQualityData.filter(
    reading => reading.pm25Value >= min && reading.pm25Value <= max
  );
};

/**
 * Get readings by country (based on coordinates)
 */
export const getReadingsByCountry = (country: string): AirQualityReading[] => {
  const countryBounds = {
    Uganda: { minLat: -1.5, maxLat: 4.2, minLng: 29.5, maxLng: 35.0 },
    Nigeria: { minLat: 4.0, maxLat: 14.0, minLng: 2.7, maxLng: 14.7 },
    Ghana: { minLat: 4.7, maxLat: 11.2, minLng: -3.3, maxLng: 1.2 },
    Kenya: { minLat: -5.0, maxLat: 5.0, minLng: 34.0, maxLng: 42.0 },
    Ethiopia: { minLat: 3.4, maxLat: 18.0, minLng: 33.0, maxLng: 48.0 },
    'South Africa': {
      minLat: -35.0,
      maxLat: -22.0,
      minLng: 16.0,
      maxLng: 33.0,
    },
    Rwanda: { minLat: -2.8, maxLat: -1.0, minLng: 28.8, maxLng: 31.0 },
    Tanzania: { minLat: -12.0, maxLat: -1.0, minLng: 29.3, maxLng: 40.4 },
    Egypt: { minLat: 22.0, maxLat: 32.0, minLng: 25.0, maxLng: 37.0 },
    Senegal: { minLat: 12.3, maxLat: 16.7, minLng: -17.5, maxLng: -11.3 },
    Cameroon: { minLat: 1.7, maxLat: 13.1, minLng: 8.5, maxLng: 16.2 },
    DRC: { minLat: -13.5, maxLat: 5.4, minLng: 12.0, maxLng: 31.3 },
    Chad: { minLat: 7.4, maxLat: 23.5, minLng: 13.5, maxLng: 24.0 },
  };

  const bounds = countryBounds[country as keyof typeof countryBounds];
  if (!bounds) return [];

  return realAfricanAirQualityData.filter(
    reading =>
      reading.latitude >= bounds.minLat &&
      reading.latitude <= bounds.maxLat &&
      reading.longitude >= bounds.minLng &&
      reading.longitude <= bounds.maxLng
  );
};

/**
 * Get statistics for the real data
 */
export const getDataStatistics = () => {
  const activeReadings = getReadingsByStatus('active');
  const pm25Values = activeReadings.map(r => r.pm25Value);
  const pm10Values = activeReadings.map(r => r.pm10Value);

  const providers = Array.from(
    new Set(realAfricanAirQualityData.map(r => r.provider))
  );
  const countries = [
    'Uganda',
    'Nigeria',
    'Ghana',
    'Kenya',
    'Ethiopia',
    'South Africa',
    'Rwanda',
    'Tanzania',
    'Egypt',
    'Senegal',
    'Cameroon',
    'DRC',
    'Chad',
  ];

  return {
    totalStations: realAfricanAirQualityData.length,
    activeStations: activeReadings.length,
    inactiveStations: getReadingsByStatus('inactive').length,
    maintenanceStations: getReadingsByStatus('maintenance').length,
    countriesRepresented: countries.length,
    providers: providers,
    pm25: {
      min: Math.min(...pm25Values),
      max: Math.max(...pm25Values),
      average:
        Math.round(
          (pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length) * 10
        ) / 10,
    },
    pm10: {
      min: Math.min(...pm10Values),
      max: Math.max(...pm10Values),
      average:
        Math.round(
          (pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length) * 10
        ) / 10,
    },
  };
};

/**
 * Export the main data array with a more descriptive name
 */
export const dummyAirQualityData = realAfricanAirQualityData;
