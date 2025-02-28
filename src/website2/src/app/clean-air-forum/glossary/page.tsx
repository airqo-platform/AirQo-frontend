import { Metadata } from 'next';

import GlossaryPage from '../../../views/cleanAirForum/glossary/GlossaryPage';

export const metadata: Metadata = {
  title: 'Glossary | Clean Air Forum',
  description:
    'Explore our glossary of key terms and pollutant types used at Clean Air Forum, providing clear definitions to help you better understand air quality management.',
};

const Page = () => {
  return <GlossaryPage />;
};

export default Page;
