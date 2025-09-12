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
import { TourProvider } from '@/common/features/tours/contexts/TourProvider';
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
        const raw = makeStore();

        // Normalize return shapes:
        // - Older API: returns Redux store instance directly
        // - Newer API: returns { store, persistor }
        let normalized;
        if (raw && typeof raw.getState === 'function') {
          // It's a Redux store instance
          normalized = {
            store: raw,
            persistor: raw.__persistor || null,
          };
        } else {
          normalized = raw || { store: null, persistor: null };
        }

        if (mounted) {
          setStoreData(normalized);
          setIsInitialized(true);
        }
      } catch (error) {
        logger.error('Store initialization error:', error);
        if (mounted) {
          // Create a basic store without persistence as fallback
          try {
            const rawFallback = makeStore();
            let fallbackNormalized;
            if (rawFallback && typeof rawFallback.getState === 'function') {
              fallbackNormalized = {
                store: rawFallback,
                persistor: rawFallback.__persistor || null,
              };
            } else {
              fallbackNormalized = rawFallback || {
                store: null,
                persistor: null,
              };
            }
            setStoreData(fallbackNormalized);
          } catch (fallbackError) {
            logger.error('Fallback store creation failed:', fallbackError);
          }
          setIsInitialized(true);
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

  // Defensive: ensure we pass a valid Redux store to react-redux Provider
  const reduxStore =
    (storeData && storeData.store) ||
    (typeof window !== 'undefined' && window.__NEXT_REDUX_STORE__) ||
    null;

  if (!reduxStore || typeof reduxStore.getState !== 'function') {
    // Log details for debugging
    logger.error('Invalid Redux store provided to Provider', {
      storeData,
      windowStore:
        typeof window !== 'undefined' ? window.__NEXT_REDUX_STORE__ : null,
    });

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg text-center">
          <h2 className="text-xl font-semibold">
            Application initialization error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The application failed to initialize its internal store. Please try
            refreshing the page. If the problem persists, contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={reduxStore}>
      {storeData.persistor ? (
        <PersistGate loading={<Loading />} persistor={storeData.persistor}>
          <ClientProvidersInner>{children}</ClientProvidersInner>
        </PersistGate>
      ) : (
        <ClientProvidersInner>{children}</ClientProvidersInner>
      )}
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
          <TourProvider>
            <ThemeInitializer />
            {children}
          </TourProvider>
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
