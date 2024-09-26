import '@/styles/global.scss';
import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { wrapper } from '@/lib/store';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';

function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const [hydrated, setHydrated] = useState(false);

  // Manually track rehydration without PersistGate
  useEffect(() => {
    setHydrated(true); // Once component mounts, consider state as hydrated

    // Disable dev tools in non-staging environments
    if (process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS !== 'staging') {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) e.preventDefault(); // Prevent F12 for dev tools
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
  if (!hydrated) return null;

  return (
    <Provider store={store}>
      <Component {...props.pageProps} />
      <Toaster expand={true} richColors />
    </Provider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default App;
