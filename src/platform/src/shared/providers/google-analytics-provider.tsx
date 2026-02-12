'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-CGRVG9F59K';

export function GoogleAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }, []);

  return (
    <Suspense fallback={null}>
      <GAPageView />
      {children}
    </Suspense>
  );
}

function GAPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      // Send pageview to Google Analytics
      ReactGA.send({ hitType: 'pageview', page: pathname });
    }
  }, [pathname]);

  return null;
}
