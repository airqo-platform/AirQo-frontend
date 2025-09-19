import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import {
  generateMetadata as createMetadata,
  generateViewport,
} from '@/lib/metadata';
import ForumEventsPage from '@/views/cleanairforum/ForumEventsPage';
import ForumHero from '@/views/cleanairforum/ForumHero';

// Generate metadata for SEO
export const metadata = createMetadata({
  title: "CLEAN-Air Forum | Africa's Premier Air Quality Convening",
  description:
    "Join Africa's annual convening for policymakers, air quality experts, industry leaders, academics, and civil society organizations. Fostering knowledge sharing and cross-border partnerships to address air pollution in African cities.",
  keywords:
    'CLEAN-Air Forum, air quality Africa, environmental conference, clean air advocacy, African cities pollution, air quality experts',
  url: '/clean-air-forum',
});

export const viewport = generateViewport();

const page = () => {
  return (
    <MainLayout topFullWidth={<ForumHero />}>
      <ForumEventsPage skipHero />
    </MainLayout>
  );
};

export default page;
