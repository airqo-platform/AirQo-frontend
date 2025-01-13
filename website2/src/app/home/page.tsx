import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/views/home/HomePage';

const page = () => {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
};

export default page;
