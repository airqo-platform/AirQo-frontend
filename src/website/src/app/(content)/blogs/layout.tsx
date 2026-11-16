import React from 'react';

import MainLayout from '@/components/layout/MainLayout';

type BlogsLayoutProps = {
  children: React.ReactNode;
};

const BlogsLayout: React.FC<BlogsLayoutProps> = ({ children }) => {
  return <MainLayout showNewsletter={false}>{children}</MainLayout>;
};

export default BlogsLayout;
