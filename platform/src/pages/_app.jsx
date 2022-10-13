import '@/styles/global.scss';
import { Provider } from 'react-redux';
import store from '../store';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
