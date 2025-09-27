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
import NetworkStatusBanner from '@/common/components/NetworkStatusBanner';

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
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const initTimeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        logger.warn('Store initialization timeout - proceeding with fallback');
        setInitError('Store initialization timeout');
        setIsInitialized(true);
      }
    }, 5000); // 5 second timeout

    async function initializeStore() {
      try {
        // makeStore is synchronous; call directly to avoid racing a
        // synchronous value with a timeout which would leave the timeout
        // rejecting unhandled later.
        const raw = makeStore();

        // Normalize return shapes with better validation
        let normalized;
        if (raw && typeof raw.getState === 'function') {
          normalized = {
            store: raw,
            persistor: raw.__persistor || null,
          };
        } else if (
          raw &&
          raw.store &&
          typeof raw.store.getState === 'function'
        ) {
          normalized = raw;
        } else {
          throw new Error('Invalid store returned from makeStore');
        }

        if (mounted) {
          clearTimeout(initTimeout);
          setStoreData(normalized);
          setIsInitialized(true);
          setInitError(null);
        }
      } catch (error) {
        logger.error('Store initialization error:', error);
        if (mounted) {
          clearTimeout(initTimeout);
          setInitError(error.message);
          setIsInitialized(true);
          // Don't set storeData on error - let it remain null
        }
      }
    }

    initializeStore();

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
    };
    // We intentionally omit 'isInitialized' from the dependency array so this
    // initialization runs once on mount. Including it causes a second run when
    // the flag flips to true which can create multiple stores. If you change
    // the initializer to close over external values, refactor into a stable
    // callback and include it here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading during initialization
  if (!isInitialized) {
    return <Loading />;
  }

  // Show error state if initialization failed
  if (
    initError ||
    !storeData?.store ||
    typeof storeData.store.getState !== 'function'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-lg text-center p-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Application Initialization Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Unable to initialize the application store. This may be due to a
            network issue or corrupted local data.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                // Clear all local storage and reload
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Data & Refresh
            </button>
          </div>
          {initError && (
            <p className="text-sm text-gray-500 mt-4">Error: {initError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Provider store={storeData.store}>
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
            <NetworkStatusBanner />
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
