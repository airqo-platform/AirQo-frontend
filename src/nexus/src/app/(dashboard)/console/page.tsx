import React from 'react';
import { Metadata } from 'next';
import OverviewSection from '@/modules/console/components/OverviewSection';

export const metadata: Metadata = {
  title: 'Console',
  description:
    'Account overview: plan usage, API client health, and recent activity.',
};

const Page = () => {
  return <OverviewSection />;
};

export default Page;
