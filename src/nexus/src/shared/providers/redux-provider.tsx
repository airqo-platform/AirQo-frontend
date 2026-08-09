'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/shared/store';
import {
  GlobalLoadingProvider,
  useGlobalLoading,
} from '@/shared/providers/global-loading-provider';

function PersistGateLoading() {
  useGlobalLoading(true, { priority: 100 });
  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <GlobalLoadingProvider>
        <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
          {children}
        </PersistGate>
      </GlobalLoadingProvider>
    </Provider>
  );
}
