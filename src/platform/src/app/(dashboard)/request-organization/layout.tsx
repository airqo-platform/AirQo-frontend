import React from 'react';
import type { Metadata } from 'next';
import { MainLayout } from '@/shared/layouts/MainLayout';

interface RequestOrganizationLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'Request Organization',
  description: 'Request to create a new organization',
};

const RequestOrganizationLayout = ({
  children,
}: RequestOrganizationLayoutProps) => {
  return <MainLayout showSidebar={false}>{children}</MainLayout>;
};

export default RequestOrganizationLayout;
