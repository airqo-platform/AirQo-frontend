'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DEVCON_COUNTDOWN_TARGET, DEVCON_ROUTE } from '@/lib/devcon';

type CompactCountdown = {
  days: number;
  hours: number;
};

const getCompactCountdown = (): CompactCountdown => {
  const difference = new Date(DEVCON_COUNTDOWN_TARGET).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
  };
};

const tickerItems = [
  'AirQo DevCon 2026',
  'Learn. Build. Ship.',
  'Makerere University',
  'Free for students',
  'Hands-on clean air technology',
];

const DevConTopTicker = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [countdown, setCountdown] = useState<CompactCountdown>(() =>
    getCompactCountdown(),
  );

  useEffect(() => {
    setIsMounted(true);
    const timer = window.setInterval(() => {
      setCountdown(getCompactCountdown());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hidden min-w-0 flex-1 px-3 lg:block">
      <div className="devcon-top-ticker flex h-8 items-center overflow-hidden rounded-lg border border-blue-100 bg-white/80 text-blue-700 shadow-sm">
        <Link
          href={DEVCON_ROUTE}
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-3 text-xs font-semibold"
          aria-label="Learn more about AirQo DevCon 2026"
        >
          <span className="flex-none rounded-lg bg-blue-600 px-2 py-0.5 text-white">
            DevCon
          </span>
          <span className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <span className="devcon-top-ticker-track inline-flex gap-8">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="flex items-center gap-2"
                >
                  <span>{item}</span>
                  <span className="h-1 w-1 rounded-full bg-blue-300" />
                </span>
              ))}
            </span>
          </span>
          <span
            className={`flex-none text-gray-600 transition-opacity duration-300 ${
              isMounted ? 'opacity-100' : 'opacity-0'
            }`}
            suppressHydrationWarning
          >
            {countdown.days}d {String(countdown.hours).padStart(2, '0')}h
          </span>
        </Link>
      </div>
    </div>
  );
};

export default DevConTopTicker;
