import '@/styles/global.scss';
import { wrapper } from '@/lib/store';

function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default wrapper.withRedux(App);
