import '../styles/globals.css';
import PropTypes from 'prop-types';
import ClientProviders from './providers/ClientProviders';

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
    <html lang="en" suppressHydrationWarning={true}>
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
      <body className="bg-background" suppressHydrationWarning={true}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
