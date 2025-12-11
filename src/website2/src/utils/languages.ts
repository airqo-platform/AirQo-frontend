export interface Language {
  code: string;
  name: string;
  flag: string;
  country: string;
  region: string;
}

// Curated list of languages based on AirQo's target regions
export const languages: Language[] = [
  // Default
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    country: 'Pan-African',
    region: 'Africa',
  },

  // Africa
  {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    country: 'France/Africa',
    region: 'Africa',
  },
  {
    code: 'sw',
    name: 'Swahili',
    flag: '🇰🇪',
    country: 'East Africa',
    region: 'Africa',
  },
  {
    code: 'ar',
    name: 'Arabic',
    flag: '🇸🇦',
    country: 'North Africa',
    region: 'Africa',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    flag: '🇵🇹',
    country: 'Portugal/Africa',
    region: 'Africa',
  },
  {
    code: 'ha',
    name: 'Hausa',
    flag: '🇳🇬',
    country: 'West Africa',
    region: 'Africa',
  },
  {
    code: 'am',
    name: 'Amharic',
    flag: '🇪🇹',
    country: 'Ethiopia',
    region: 'Africa',
  },
  {
    code: 'zu',
    name: 'Zulu',
    flag: '🇿🇦',
    country: 'Southern Africa',
    region: 'Africa',
  },

  // Europe
  {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    country: 'Spain/S.America',
    region: 'Europe',
  },
  {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    country: 'Germany',
    region: 'Europe',
  },
  {
    code: 'it',
    name: 'Italian',
    flag: '🇮🇹',
    country: 'Italy',
    region: 'Europe',
  },
  {
    code: 'pl',
    name: 'Polish',
    flag: '🇵🇱',
    country: 'Poland',
    region: 'Europe',
  },
  {
    code: 'nl',
    name: 'Dutch',
    flag: '🇳🇱',
    country: 'Netherlands',
    region: 'Europe',
  },
  {
    code: 'ru',
    name: 'Russian',
    flag: '🇷🇺',
    country: 'Russia',
    region: 'Europe',
  },

  // Asia
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    flag: '🇨🇳',
    country: 'China',
    region: 'Asia',
  },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', country: 'India', region: 'Asia' },
  {
    code: 'ja',
    name: 'Japanese',
    flag: '🇯🇵',
    country: 'Japan',
    region: 'Asia',
  },
  {
    code: 'ko',
    name: 'Korean',
    flag: '🇰🇷',
    country: 'South Korea',
    region: 'Asia',
  },
  { code: 'th', name: 'Thai', flag: '🇹🇭', country: 'Thailand', region: 'Asia' },
  {
    code: 'vi',
    name: 'Vietnamese',
    flag: '🇻🇳',
    country: 'Vietnam',
    region: 'Asia',
  },
  {
    code: 'id',
    name: 'Indonesian',
    flag: '🇮🇩',
    country: 'Indonesia',
    region: 'Asia',
  },
];
