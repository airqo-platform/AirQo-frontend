import '@/styles/global.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { wrapper } from '@/lib/store';
import { useEffect } from 'react';

export default function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const persistor = persistStore(store);

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS === 'staging' ||
      process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS === 'production'
    ) {
      return;
    } else {
      // Disable context menu (right click)
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      // Disable F12 key (open developer tools)
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) {
          e.preventDefault();
        }
      });
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...props.pageProps} />
      </PersistGate>
    </Provider>
  );
}
