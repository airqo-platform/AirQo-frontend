'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

type SolutionsContentLayoutProps = {
  children: React.ReactNode;
};

const SolutionsContentLayout: React.FC<SolutionsContentLayoutProps> = ({
  children,
}) => {
  const segment = useSelectedLayoutSegment();

  if (segment === 'network-coverage') {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default SolutionsContentLayout;
