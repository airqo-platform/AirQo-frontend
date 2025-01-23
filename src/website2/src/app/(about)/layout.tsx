import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

type AboutLayoutProps = {
  children: React.ReactNode;
};

const AboutLayout: React.FC<AboutLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default AboutLayout;
