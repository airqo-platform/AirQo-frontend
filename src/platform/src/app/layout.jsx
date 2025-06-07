import '../styles/globals.css';
import PropTypes from 'prop-types';
import ClientProviders from './providers/ClientProviders';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AirQo Analytics',
  description: 'Air quality monitoring and analytics platform',
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon.ico',
  },
};

// This is the root layout for the App Router
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
