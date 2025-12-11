export interface Language {
  code: string;
  name: string;
  flag: string; // ISO country code for flag (e.g., 'us', 'gb', 'fr')
  country: string;
  region: string;
}

// Helper function to get flag URL from country code
export const getFlagUrl = (countryCode: string): string => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

// Curated list of languages based on AirQo's target regions
export const languages: Language[] = [
  // Default
  {
    code: 'en',
    name: 'English (US)',
    flag: 'us',
    country: 'United States',
    region: 'Global',
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    flag: 'gb',
    country: 'United Kingdom',
    region: 'Europe',
  },

  // Africa
  {
    code: 'fr',
    name: 'French',
    flag: 'fr',
    country: 'France/Africa',
    region: 'Africa',
  },
  {
    code: 'sw',
    name: 'Swahili',
    flag: 'ke',
    country: 'East Africa',
    region: 'Africa',
  },
  {
    code: 'ar',
    name: 'Arabic',
    flag: 'sa',
    country: 'North Africa',
    region: 'Africa',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    flag: 'pt',
    country: 'Portugal/Africa',
    region: 'Africa',
  },
  {
    code: 'ha',
    name: 'Hausa',
    flag: 'ng',
    country: 'West Africa',
    region: 'Africa',
  },
  {
    code: 'am',
    name: 'Amharic',
    flag: 'et',
    country: 'Ethiopia',
    region: 'Africa',
  },
  {
    code: 'zu',
    name: 'Zulu',
    flag: 'za',
    country: 'Southern Africa',
    region: 'Africa',
  },
  {
    code: 'yo',
    name: 'Yoruba',
    flag: 'ng',
    country: 'Nigeria',
    region: 'Africa',
  },
  {
    code: 'ig',
    name: 'Igbo',
    flag: 'ng',
    country: 'Nigeria',
    region: 'Africa',
  },
  {
    code: 'so',
    name: 'Somali',
    flag: 'so',
    country: 'Somalia',
    region: 'Africa',
  },
  {
    code: 'rw',
    name: 'Kinyarwanda',
    flag: 'rw',
    country: 'Rwanda',
    region: 'Africa',
  },
  {
    code: 'mg',
    name: 'Malagasy',
    flag: 'mg',
    country: 'Madagascar',
    region: 'Africa',
  },

  // Europe
  {
    code: 'es',
    name: 'Spanish',
    flag: 'es',
    country: 'Spain/S.America',
    region: 'Europe',
  },
  {
    code: 'de',
    name: 'German',
    flag: 'de',
    country: 'Germany',
    region: 'Europe',
  },
  {
    code: 'it',
    name: 'Italian',
    flag: 'it',
    country: 'Italy',
    region: 'Europe',
  },
  {
    code: 'pl',
    name: 'Polish',
    flag: 'pl',
    country: 'Poland',
    region: 'Europe',
  },
  {
    code: 'nl',
    name: 'Dutch',
    flag: 'nl',
    country: 'Netherlands',
    region: 'Europe',
  },
  {
    code: 'ru',
    name: 'Russian',
    flag: 'ru',
    country: 'Russia',
    region: 'Europe',
  },
  {
    code: 'sv',
    name: 'Swedish',
    flag: 'se',
    country: 'Sweden',
    region: 'Europe',
  },
  {
    code: 'fi',
    name: 'Finnish',
    flag: 'fi',
    country: 'Finland',
    region: 'Europe',
  },

  // Asia
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    flag: 'cn',
    country: 'China',
    region: 'Asia',
  },
  { code: 'hi', name: 'Hindi', flag: 'in', country: 'India', region: 'Asia' },
  {
    code: 'ja',
    name: 'Japanese',
    flag: 'jp',
    country: 'Japan',
    region: 'Asia',
  },
  {
    code: 'ko',
    name: 'Korean',
    flag: 'kr',
    country: 'South Korea',
    region: 'Asia',
  },
  { code: 'th', name: 'Thai', flag: 'th', country: 'Thailand', region: 'Asia' },
  {
    code: 'vi',
    name: 'Vietnamese',
    flag: 'vn',
    country: 'Vietnam',
    region: 'Asia',
  },
  {
    code: 'id',
    name: 'Indonesian',
    flag: 'id',
    country: 'Indonesia',
    region: 'Asia',
  },
];
