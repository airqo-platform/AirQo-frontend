import '../styles/globals.css';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { wrapper } from '@/lib/store';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import Loading from '@/components/Loader';
import ErrorBoundary from '../common/components/ErrorBoundary';
import { PersistGate } from 'redux-persist/integration/react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import logger from '@/lib/logger';

import { ThemeProvider } from '@/features/theme-customizer/context/ThemeContext';
import { ThemeCustomizer } from '@/features/theme-customizer/components/ThemeCustomizer';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { handleGoogleLoginFromCookie } from '@/core/utils/googleLoginFromCookie';

function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const router = useRouter();
  const dispatch = store.dispatch;

  useEffect(() => {
    // 🚨 Track Google login redirect
    const { success } = router.query;

    if (success === 'google') {
      handleGoogleLoginFromCookie(dispatch);
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl, undefined, { shallow: true });
    }
  }, [router.query, dispatch]);

  useEffect(() => {
    // Set up global error handlers
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

    // Manage devtools access based on environment
    const manageDevTools = () => {
      const currentEnv =
        process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS ||
        process.env.NODE_ENV ||
        'development';
      const isDevOrStaging =
        currentEnv === 'development' || currentEnv === 'staging';

      // Only disable dev tools in production
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

      // In development or staging, no need to disable anything
      return () => {};
    };

    // Set up error handlers in all environments
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    // Invoke the dev tools function and clean up on unmount
    const cleanupDevTools = manageDevTools();

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      cleanupDevTools();
    };
  }, []);

  // Use getLayout pattern if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <ErrorBoundary name="AppRoot" feature="global">
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={store.__persistor}>
          <ThemeProvider>
            <GoogleAnalytics />
            {getLayout(<Component {...props.pageProps} />)}
            <ThemeCustomizer />
          </ThemeProvider>
          <Toaster expand={true} richColors />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default App;
