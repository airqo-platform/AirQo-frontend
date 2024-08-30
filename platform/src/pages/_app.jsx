import '@/styles/global.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { wrapper } from '@/lib/store';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import Loading from '@/components/Loader';

function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const persistor = persistStore(store);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS !== 'staging') {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) e.preventDefault();
      });
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <Component {...props.pageProps} />
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
