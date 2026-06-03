'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { COOKIE_POLICY_URL } from '@/lib/envConstants';
import ReusableButton from '@/components/shared/button/ReusableButton';

export function CookieInfoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('vertex_cookies_accepted');
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('vertex_cookies_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-primary text-white py-3 px-4 shadow">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 sm:flex-row w-full">
        <p className="m-0 text-center text-sm sm:text-left">
          AirQo uses cookies to deliver and enhance the quality of its services and to analyze traffic.
          {' '}
          <Link 
            href={COOKIE_POLICY_URL} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline hover:text-white/80 transition-colors"
          >
            Learn more about our cookie policy
          </Link>
        </p>
        <ReusableButton
          variant="outlined"
          onClick={handleDismiss}
          className="rounded-md bg-white px-4 py-1 text-sm font-medium text-primary transition-colors hover:bg-white/90 active:bg-white/80 hover:text-primary cursor-pointer"
        >
          OK, got it
        </ReusableButton>
      </div>
    </div>
  );
}