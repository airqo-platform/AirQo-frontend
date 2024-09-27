import '@/styles/global.scss';
import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { wrapper } from '@/lib/store';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import Loading from '@/components/Loader';
import ErrorBoundary from './ErrorBoundary';

function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    // Disable dev tools in non-staging environments
    if (process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS !== 'staging') {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) e.preventDefault();
      });
    }

    return () => {
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
      document.removeEventListener('keydown', (e) => {
        if (e.keyCode === 123) e.preventDefault();
      });
    };
  }, []);

  // Only show the component if hydration is complete
  if (!hydrated) return <Loading />;

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Component {...props.pageProps} />
      </ErrorBoundary>
      <Toaster expand={true} richColors />
    </Provider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default App;
