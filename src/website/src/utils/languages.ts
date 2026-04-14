export interface Language {
  code: string;
  name: string;
  flag: string; // ISO country code for flag (e.g., 'us', 'gb', 'fr')
  country: string;
  region: string;
  offlineSupport?: boolean;
}

// Helper function to get flag URL from country code
export const getFlagUrl = (countryCode: string): string => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

// Curated list for AirQo's target regions and prioritized international coverage.
// Ordered so high-resource international languages appear first in the selector.
export const languages: Language[] = [
  // International Languages (load first)
  {
    code: 'en-GB',
    name: 'English (UK)',
    flag: 'gb',
    country: 'United Kingdom',
    region: 'International Priority',
  },
  {
    code: 'fr',
    name: 'French',
    flag: 'fr',
    country: 'France/Francophone Africa',
    region: 'International Priority',
  },
  {
    code: 'ar',
    name: 'Arabic',
    flag: 'eg',
    country: 'North Africa/Middle East',
    region: 'International Priority',
    offlineSupport: true,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    flag: 'pt',
    country: 'Portugal/Brazil/Lusophone Africa',
    region: 'International Priority',
  },
  {
    code: 'es',
    name: 'Spanish',
    flag: 'es',
    country: 'Spain/Latin America',
    region: 'International Priority',
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    flag: 'cn',
    country: 'China',
    region: 'International Priority',
  },
  {
    code: 'hi',
    name: 'Hindi',
    flag: 'in',
    country: 'India',
    region: 'International Priority',
  },
  {
    code: 'ur',
    name: 'Urdu',
    flag: 'pk',
    country: 'Pakistan',
    region: 'International Priority',
  },
  {
    code: 'lg',
    name: 'Luganda',
    flag: 'ug',
    country: 'Uganda',
    region: 'International Priority',
  },
  {
    code: 'ru',
    name: 'Russian',
    flag: 'ru',
    country: 'Russia',
    region: 'International Priority',
  },
  {
    code: 'la',
    name: 'Latin',
    flag: 'va',
    country: 'Vatican City',
    region: 'International Priority',
  },
  {
    code: 'he',
    name: 'Hebrew',
    flag: 'il',
    country: 'Israel',
    region: 'International Priority',
  },
  {
    code: 'nl',
    name: 'Dutch',
    flag: 'nl',
    country: 'Netherlands',
    region: 'International Priority',
  },
  {
    code: 'tr',
    name: 'Turkish',
    flag: 'tr',
    country: 'Turkey',
    region: 'International Priority',
  },
  {
    code: 'ja',
    name: 'Japanese',
    flag: 'jp',
    country: 'Japan',
    region: 'International Priority',
  },

  // East Africa
  {
    code: 'sw',
    name: 'Swahili',
    flag: 'ke',
    country: 'East Africa',
    region: 'East Africa',
  },
  {
    code: 'am',
    name: 'Amharic',
    flag: 'et',
    country: 'Ethiopia',
    region: 'East Africa',
  },
  {
    code: 'rw',
    name: 'Kinyarwanda',
    flag: 'rw',
    country: 'Rwanda',
    region: 'East Africa',
  },
  {
    code: 'so',
    name: 'Somali',
    flag: 'so',
    country: 'Somalia',
    region: 'East Africa',
  },

  // West Africa
  {
    code: 'ha',
    name: 'Hausa',
    flag: 'ng',
    country: 'Nigeria',
    region: 'West Africa',
    offlineSupport: true,
  },
  {
    code: 'yo',
    name: 'Yoruba',
    flag: 'ng',
    country: 'Nigeria',
    region: 'West Africa',
  },
  {
    code: 'ig',
    name: 'Igbo',
    flag: 'ng',
    country: 'Nigeria',
    region: 'West Africa',
  },
  {
    code: 'tw',
    name: 'Twi',
    flag: 'gh',
    country: 'Ghana',
    region: 'West Africa',
  },

  // Southern Africa
  {
    code: 'zu',
    name: 'Zulu',
    flag: 'za',
    country: 'South Africa',
    region: 'Southern Africa',
    offlineSupport: true,
  },
  {
    code: 'xh',
    name: 'Xhosa',
    flag: 'za',
    country: 'South Africa',
    region: 'Southern Africa',
    offlineSupport: true,
  },
  {
    code: 'af',
    name: 'Afrikaans',
    flag: 'za',
    country: 'South Africa',
    region: 'Southern Africa',
  },
  {
    code: 'st',
    name: 'Sesotho',
    flag: 'ls',
    country: 'Lesotho/South Africa',
    region: 'Southern Africa',
    offlineSupport: true,
  },
  {
    code: 'sn',
    name: 'Shona',
    flag: 'zw',
    country: 'Zimbabwe',
    region: 'Southern Africa',
  },

  // North Africa
  {
    code: 'tzm',
    name: 'Tamazight (Amazigh)',
    flag: 'ma',
    country: 'Morocco/North Africa',
    region: 'North Africa',
  },
];
