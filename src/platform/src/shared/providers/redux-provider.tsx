'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/shared/store';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingOverlay />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
