import '@/styles/global.scss';
import { wrapper } from '@/lib/store';
import { Provider } from 'react-redux';

export default function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  return (
    <Provider store={store}>
      <Component {...props.pageProps} />
    </Provider>
  );
}
