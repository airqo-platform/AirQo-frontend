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
      titleKey: 'accordion.cities.highResolution.title',
      contentKey: 'accordion.cities.highResolution.content',
    },
    {
      titleKey: 'accordion.cities.digitalPlatforms.title',
      contentKey: 'accordion.cities.digitalPlatforms.content',
    },
    {
      titleKey: 'accordion.cities.policyEngagement.title',
      contentKey: 'accordion.cities.policyEngagement.content',
    },
  ],
  communities: [
    {
      titleKey: 'accordion.communities.champions.title',
      contentKey: 'accordion.communities.champions.content',
    },
    {
      titleKey: 'accordion.communities.freeAccess.title',
      contentKey: 'accordion.communities.freeAccess.content',
    },
    {
      titleKey: 'accordion.communities.hosts.title',
      contentKey: 'accordion.communities.hosts.content',
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
