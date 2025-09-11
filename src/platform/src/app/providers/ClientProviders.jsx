'use client';

import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import Loading from '../loading';
import ErrorBoundary from '../../common/components/ErrorBoundary';
import { PersistGate } from 'redux-persist/integration/react';
import logger from '@/lib/logger';
import makeStore from '@/lib/store';
import NextAuthProvider from './NextAuthProvider';
import SWRProvider from './SWRProvider';
import SessionWatchProvider from './SessionWatchProvider';
import { ThemeProvider } from '@/common/features/theme-customizer/context/ThemeContext';
import UnifiedGroupProvider from './UnifiedGroupProvider';
import { useThemeInitialization } from '@/core/hooks';

/**
 * Component that initializes theme settings for authenticated users
 */
function ThemeInitializer() {
  useThemeInitialization();
  return null;
}

function ReduxProviders({ children }) {
  const [storeData, setStoreData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeStore() {
      try {
        const { store, persistor } = makeStore();

        if (mounted) {
          setStoreData({ store, persistor });
          setIsInitialized(true);
        }
      } catch (error) {
        logger.error('Store initialization error:', error);
        if (mounted) {
          setIsInitialized(true); // Still set to true to prevent infinite loading
        }
      }
    }

    initializeStore();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isInitialized) {
    return <Loading />;
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to initialize application. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <Provider store={storeData.store}>
      <PersistGate loading={<Loading />} persistor={storeData.persistor}>
        <ClientProvidersInner>{children}</ClientProvidersInner>
      </PersistGate>
    </Provider>
  );
}

function ClientProvidersInner({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedGroupProvider>
          <ThemeInitializer />
          {children}
        </UnifiedGroupProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Main client providers component
export default function ClientProviders({ children }) {
  return (
    <NextAuthProvider>
      <SWRProvider>
        <ReduxProviders>
          <SessionWatchProvider>{children}</SessionWatchProvider>
        </ReduxProviders>
      </SWRProvider>
      <Toaster
        richColors
        position="top-right"
        expand={false}
        closeButton
        toastOptions={{
          duration: 5000,
          style: {
            fontSize: '14px',
          },
        }}
      />
    </NextAuthProvider>
  );
}

ClientProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

ReduxProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

ClientProvidersInner.propTypes = {
  children: PropTypes.node.isRequired,
};
