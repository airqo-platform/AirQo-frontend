'use client';

import React from 'react';

import { QueryProvider } from './QueryProvider';
import { ReduxDataProvider } from './ReduxProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ReduxDataProvider>
      <QueryProvider>{children}</QueryProvider>
    </ReduxDataProvider>
  );
};

export default AppProviders;
