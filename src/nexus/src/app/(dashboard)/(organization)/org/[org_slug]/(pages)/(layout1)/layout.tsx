import React from 'react';
import type { Metadata } from 'next';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { generateOrgMetadata } from '@/shared/lib/metadata';

interface OrgLayoutProps {
  children: React.ReactNode;
  params: {
    org_slug: string;
  };
}

export async function generateMetadata({
  params,
}: OrgLayoutProps): Promise<Metadata> {
  const { org_slug } = params;
  // Dashboard is the default organization destination.
  return generateOrgMetadata(org_slug, 'dashboard');
}

const OrgLayout = ({ children }: OrgLayoutProps) => {
  return <MainLayout>{children}</MainLayout>;
};

export default OrgLayout;
