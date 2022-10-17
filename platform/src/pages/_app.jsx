import '@/styles/global.scss';
import { wrapper } from '@/lib/redux/store';

function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default wrapper.withRedux(App);
