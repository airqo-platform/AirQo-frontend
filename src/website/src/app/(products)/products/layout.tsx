import React from 'react';

import MainLayout from '@/components/layout/MainLayout';

type ProductsLayoutProps = {
  children: React.ReactNode;
};

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default ProductsLayout;
