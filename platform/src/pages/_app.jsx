import '@/styles/global.scss';
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="icons/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
