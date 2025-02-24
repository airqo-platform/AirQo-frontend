import Enabel from '@public/assets/images/partners/enabel.svg';
import Google from '@public/assets/images/partners/google.svg';
import UN from '@public/assets/images/partners/UN.svg';
import UsMission from '@public/assets/images/partners/usmissionuganda.svg';
import WorldBank from '@public/assets/images/partners/worldbankgroup.svg';
import Community from '@public/assets/svgs/ImpactNumbers/Community.svg';
import Monitor from '@public/assets/svgs/ImpactNumbers/Monitor.svg';
import Network from '@public/assets/svgs/ImpactNumbers/Network.svg';
import Partners from '@public/assets/svgs/ImpactNumbers/Partners.svg';
import Publications from '@public/assets/svgs/ImpactNumbers/Publications.svg';
import Records from '@public/assets/svgs/ImpactNumbers/Records.svg';

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
    icon: Network,
  },
  {
    label: 'Community Champions',
    key: 'champions',
    icon: Community,
  },
  {
    label: 'Monitor Installations',
    key: 'deployed_monitors',
    icon: Monitor,
  },
  {
    label: 'Data records',
    key: 'data_records',
    icon: Records,
  },
  {
    label: 'Research papers',
    key: 'research_papers',
    icon: Publications,
  },
  {
    label: 'Partners',
    key: 'partners',
    icon: Partners,
  },
];
