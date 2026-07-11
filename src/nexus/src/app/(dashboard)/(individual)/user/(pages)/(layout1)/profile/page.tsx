import React from 'react';
import { Metadata } from 'next';
import { ProfilePage } from '@/modules/user-profile';

export const metadata: Metadata = {
  title: 'User Profile',
  description:
    'Manage your AirQo account settings, profile information, security, and preferences.',
  openGraph: {
    title: 'User Profile | AirQo Nexus',
    description:
      'Manage your AirQo account settings, profile information, security, and preferences.',
    images: [
      {
        url: '/images/illustration.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Nexus - User Profile',
      },
    ],
  },
};

const Page = () => {
  return <ProfilePage />;
};

export default Page;
