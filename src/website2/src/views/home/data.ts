/* eslint-disable simple-import-sort/imports */
import Enabel from '@public/assets/images/partners/enabel.svg';
import Google from '@public/assets/images/partners/google.svg';
import UN from '@public/assets/images/partners/UN.svg';
import UsMission from '@public/assets/images/partners/usmissionuganda.svg';
import WorldBank from '@public/assets/images/partners/worldbankgroup.svg';
import {
  AqData,
  AqFile02,
  AqGlobe05,
  AqMonitor,
  AqStar06,
  AqCoinsHand,
} from '@airqo/icons-react';
/* eslint-enable simple-import-sort/imports */

export const partnerLogos = [Google, UsMission, Enabel, WorldBank, UN];

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

export const statItems = [
  {
    label: 'African Cities',
    key: 'african_cities',
    icon: AqGlobe05,
    color: '#145DFF',
  },
  {
    label: 'Community Champions',
    key: 'champions',
    icon: AqStar06,
    color: '#10B981',
  },
  {
    label: 'Monitor Installations',
    key: 'deployed_monitors',
    icon: AqMonitor,
    color: '#F59E0B',
  },
  {
    label: 'Data records',
    key: 'data_records',
    icon: AqData,
    color: '#EF4444',
  },
  {
    label: 'Research papers',
    key: 'research_papers',
    icon: AqFile02,
    color: '#8B5CF6',
  },
  {
    label: 'Partners',
    key: 'partners',
    icon: AqCoinsHand,
    color: '#06B6D4',
  },
];
