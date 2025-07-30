'use client';

import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import Loading from '../loading';
import ErrorBoundary from '../../common/components/ErrorBoundary';
import { PersistGate } from 'redux-persist/integration/react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import logger from '@/lib/logger';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { handleGoogleLoginFromCookie } from '@/core/utils/googleLoginFromCookie';
import makeStore from '@/lib/store';
import NextAuthProvider from './NextAuthProvider';
import SWRProvider from './SWRProvider';
import { ThemeProvider } from '@/common/features/theme-customizer/context/ThemeContext';
import UnifiedGroupProvider from './UnifiedGroupProvider';
import LogoutProvider from './LogoutProvider';
import { useThemeInitialization } from '@/core/hooks';
import { TourProvider } from '@/features/tours/contexts/TourProvider';
// Import environment validation
import { validateEnvironment } from '@/lib/envConstants';

/**
 * Component that initializes theme settings for authenticated users
 * This runs globally and handles theme loading during login setup
 */
function ThemeInitializer() {
  useThemeInitialization();
  return null; // This component doesn't render anything
}

function ReduxProviders({ children }) {
  const [store, setStore] = useState(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Initialize environment validation
    try {
      // Validate environment variables (for development debugging only)
      const envValidation = validateEnvironment();
      if (
        envValidation.errors.length > 0 &&
        process.env.NODE_ENV === 'development'
      ) {
        logger.error('Environment validation errors:', envValidation.errors);
      }
      if (
        envValidation.warnings.length > 0 &&
        process.env.NODE_ENV === 'development'
      ) {
        logger.warn('Environment validation warnings:', envValidation.warnings);
      }

      logger.info('Environment validation completed');
    } catch (error) {
      logger.error('Failed to initialize validation systems:', error);
    }

    // Create store only on client side
    const storeInstance = makeStore();
    setStore(storeInstance);
  }, []);

  // Don't render anything on server side to prevent hydration mismatch
  if (!isClient || !store) {
    return <Loading />;
  }
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={store.__persistor}>
        <ClientProvidersInner>{children}</ClientProvidersInner>
      </PersistGate>
    </Provider>
  );
}

function ClientProvidersInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 🚨 Track Google login redirect
    const success = searchParams.get('success');

    if (success === 'google') {
      // We need to access the store differently now
      // This will need to be refactored to use useDispatch hook
      handleGoogleLoginFromCookie();
      // Construct the URL without the 'success' query parameter
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('success');
      const cleanUrl = `${pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
      router.replace(cleanUrl, { shallow: true });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const handleGlobalError = (event) => {
      event.preventDefault();
      logger.error('Uncaught error', event.error || new Error(event.message), {
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    };

    const handlePromiseRejection = (event) => {
      event.preventDefault();
      logger.error(
        'Unhandled promise rejection',
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
      );
    };

    const manageDevTools = () => {
      const currentEnv =
        process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS ||
        process.env.NODE_ENV ||
        'development';
      const isDevOrStaging =
        currentEnv === 'development' || currentEnv === 'staging';

      if (!isDevOrStaging) {
        const handleContextMenu = (e) => e.preventDefault();
        const handleF12 = (e) => {
          if (e.keyCode === 123) e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleF12);

        return () => {
          document.removeEventListener('contextmenu', handleContextMenu);
          document.removeEventListener('keydown', handleF12);
        };
      }
      return () => {};
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    const cleanupDevTools = manageDevTools();

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      cleanupDevTools();
    };
  }, []);

  return (
    <ErrorBoundary name="AppRoot" feature="global">
      {children}
      <GoogleAnalytics />
      <Toaster expand={true} richColors />
    </ErrorBoundary>
  );
}

export default function ClientProviders({ children }) {
  return (
    <NextAuthProvider>
      <SWRProvider>
        <ReduxProviders>
          <ThemeProvider>
            <ThemeInitializer />
            <LogoutProvider>
              <UnifiedGroupProvider>
                <TourProvider>{children}</TourProvider>
              </UnifiedGroupProvider>
            </LogoutProvider>
          </ThemeProvider>
        </ReduxProviders>
      </SWRProvider>
    </NextAuthProvider>
  );
}

ClientProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

ClientProvidersInner.propTypes = {
  children: PropTypes.node.isRequired,
};

ReduxProviders.propTypes = {
  children: PropTypes.node.isRequired,
};
