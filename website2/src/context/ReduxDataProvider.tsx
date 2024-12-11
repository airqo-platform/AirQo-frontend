'use client';
import React from 'react';
import { Provider } from 'react-redux';

import store from '@/store';

export const ReduxDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Provider store={store}>{children}</Provider>;
