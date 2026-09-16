/* eslint-disable simple-import-sort/imports */
import Google from '@public/assets/images/partners/google.svg';
import UN from '@public/assets/images/partners/UN.svg';
import UsMission from '@public/assets/images/partners/usmissionuganda.svg';
import WorldBank from '@public/assets/images/partners/worldbankgroup.svg';
import type { IconType } from 'react-icons';
import {
  FiDatabase,
  FiFileText,
  FiGlobe,
  FiMonitor,
  FiStar,
  FiUsers,
} from 'react-icons/fi';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';
/* eslint-enable simple-import-sort/imports */

interface StatItem {
  label: string;
  key: string;
  icon: IconType;
  color: string;
}

export const partnerLogos = [
  Google,
  UsMission,
  optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757926788/website/uploads/partners/logos/CleanAirFund-Logo-ORANGE-CMYK_1_cabye7.png',
    { width: 440 },
  ),
  WorldBank,
  UN,
];

export const accordionItems = {
  cities: [
    {
      title: 'High resolution monitoring networks',
      content:
        'We build locally adapted monitoring networks that close critical data gaps and provide cities with trusted, hyperlocal air quality data.',
    },
    {
      title: 'Open digital solutions',
      content:
        'We make air quality data open, accessible and usable, helping city leaders turn evidence into decisions and action.',
    },
    {
      title: 'City and policy engagement',
      content:
        'We work with city authorities and government agencies to strengthen the use of air quality data in planning, policy and public health action.',
    },
  ],
  communities: [
    {
      title: 'AirQommunity champions',
      content:
        'We support a growing network of local changemakers who use air quality information to raise awareness and drive action.',
    },
    {
      title: 'Access to air quality information',
      content:
        'We equip communities to understand and use air quality information by providing free access to timely, local data.',
    },
    {
      title: 'Community hosts',
      // TODO: confirm ending — source screenshot was cut off after "enabling reliable,"
      content:
        'Local residents host AirQo monitors, enabling reliable, community rooted air quality monitoring.',
    },
  ],
};

export const statItems: StatItem[] = [
  {
    label: 'African Cities',
    key: 'african_cities',
    icon: FiGlobe,
    color: '#145DFF',
  },
  {
    label: 'Community Champions',
    key: 'champions',
    icon: FiStar,
    color: '#10B981',
  },
  {
    label: 'Monitor Installations',
    key: 'deployed_monitors',
    icon: FiMonitor,
    color: '#F59E0B',
  },
  {
    label: 'Data records',
    key: 'data_records',
    icon: FiDatabase,
    color: '#EF4444',
  },
  {
    label: 'Research papers',
    key: 'research_papers',
    icon: FiFileText,
    color: '#8B5CF6',
  },
  {
    label: 'Partners',
    key: 'partners',
    icon: FiUsers,
    color: '#06B6D4',
  },
];
