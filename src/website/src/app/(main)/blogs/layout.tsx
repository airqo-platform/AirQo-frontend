import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

type BlogsLayoutProps = {
  children: React.ReactNode;
};

const BlogsLayout: React.FC<BlogsLayoutProps> = ({ children }) => {
  return (
    <MainLayout showMarketingSections={false} showNewsletter={false}>
      {children}
    </MainLayout>
  );
};

export default BlogsLayout;
