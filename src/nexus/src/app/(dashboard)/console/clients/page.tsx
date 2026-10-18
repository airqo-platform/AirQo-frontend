import React from 'react';
import { Metadata } from 'next';
import ApiClientPage from '@/modules/api-client/ApiClientPage';

export const metadata: Metadata = {
  title: 'API Clients',
  description:
    'Create and manage your API clients and access tokens for authenticating integrations.',
};

const Page = () => {
  return <ApiClientPage />;
};

export default Page;
