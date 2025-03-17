import { Metadata } from 'next';

import GlossaryPage from '@/views/cleanairforum/glossary/GlossaryPage';

export const metadata: Metadata = {
  title: 'Air Quality Terms & Definitions',
  description:
    'Understand key air quality terms, metrics, and terminology used at the Clean Air Forum. A comprehensive glossary for conference attendees and air quality professionals.',
  keywords:
    'air quality glossary, environmental terms, Clean Air Forum terminology, air pollution definitions, air quality metrics, environmental glossary',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/glossary',
  },
  openGraph: {
    title: 'Air Quality Terms & Definitions | Clean Air Forum 2024',
    description:
      'Comprehensive glossary of air quality terms and definitions for conference attendees.',
  },
};

const Page = () => {
  return <GlossaryPage />;
};

export default Page;
