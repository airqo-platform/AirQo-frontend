'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export function GoogleAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Only initialize Google Analytics if measurement ID is configured
    if (GA_MEASUREMENT_ID) {
      ReactGA.initialize(GA_MEASUREMENT_ID);
    }
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
    // Only send pageview if GA is configured
    if (pathname && GA_MEASUREMENT_ID) {
      // Send pageview to Google Analytics
      ReactGA.send({ hitType: 'pageview', page: pathname });
    }
  }, [pathname]);

  return null;
}
