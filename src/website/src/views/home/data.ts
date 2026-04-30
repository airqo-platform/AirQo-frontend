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
  'http://res.cloudinary.com/dbibjvyhm/image/upload/v1757926788/website/uploads/partners/logos/CleanAirFund-Logo-ORANGE-CMYK_1_cabye7.png',
  WorldBank,
  UN,
];

export const accordionItems = {
  cities: [
    {
      title: 'High Resolution Network',
      content:
        'We want cleaner air in all African cities. We leverage our understanding of the African context.',
    },
    {
      title: 'Digital air quality platforms',
      content:
        'We empower decision-makers in African cities We increase access to air quality data evidence.',
    },
    {
      title: 'Policy engagement',
      content:
        'We engage city authorities and government agencies We empower local leaders with air quality information.',
    },
  ],
  communities: [
    {
      title: 'AirQommunity Champions',
      content:
        'A growing network of individual change makers Championing local leaders and demand action.',
    },
    {
      title: 'Free Access To Air Quality Information',
      content:
        'We train individuals and communities Facilitating access to air quality information.',
    },
    {
      title: 'AirQo Hosts',
      content:
        'We engage locals host our deployment activities We involve locals in our maintenance drives.',
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
