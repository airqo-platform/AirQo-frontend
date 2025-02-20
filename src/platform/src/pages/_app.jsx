import '@/styles/global.scss';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { wrapper } from '@/lib/store';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import Loading from '@/components/Loader';
import ErrorBoundary from './ErrorBoundary';
import { PersistGate } from 'redux-persist/integration/react';

function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);

  useEffect(() => {
    // Disable dev tools in non-staging environments
    const disableDevTools = () => {
      const handleContextMenu = (e) => e.preventDefault();
      const handleF12 = (e) => {
        if (e.keyCode === 123) e.preventDefault();
      };

      if (process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS !== 'staging') {
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleF12);
      }

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleF12);
      };
    };

    // Invoke the function and clean up on unmount
    const cleanupDevTools = disableDevTools();

    return cleanupDevTools;
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={store.__persistor}>
        <ErrorBoundary>
          <Component {...props.pageProps} />
        </ErrorBoundary>
        <Toaster expand={true} richColors />
      </PersistGate>
    </Provider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default App;
