'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieInfoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0066b3] text-white py-3 px-4 shadow">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 sm:flex-row w-full">
        <p className="m-0 text-center text-sm sm:text-left">
          AirQo uses cookies to deliver and enhance the quality of its services and to analyze traffic.
          {' '}
          <Link 
            href="https://airqo.net/legal/cookies" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline hover:text-white/80 transition-colors"
          >
            Learn more
          </Link>
        </p>
        <button
          onClick={handleDismiss}
          className="rounded-md bg-white px-4 py-1 text-sm font-medium text-[#0066b3] transition-colors hover:bg-white/90 active:bg-white/80 cursor-pointer"
        >
          OK, got it
        </button>
      </div>
    </div>
  );
}