'use client';

import Link from 'next/link';

import { DEVCON_ROUTE } from '@/lib/devcon';

const tickerItems = [
  'AirQo DevCon 2026',
  'Learn. Build. Ship.',
  'Makerere University',
  'Free for students',
  'Hands-on clean air technology',
];

const DevConTopTicker = () => {
  return (
    <div className="hidden min-w-0 flex-1 px-3 lg:block">
      <div className="devcon-top-ticker flex h-11 items-center overflow-hidden rounded-md border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50 text-blue-700 shadow-sm">
        <Link
          href={DEVCON_ROUTE}
          className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden px-4 text-[13px] font-semibold"
          aria-label="Learn more about AirQo DevCon 2026"
        >
          <span className="flex-none rounded-md bg-blue-600 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white">
            DevCon
          </span>
          <span className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap text-blue-800">
            <span className="devcon-top-ticker-track inline-flex gap-10">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="flex items-center gap-2.5"
                >
                  <span>{item}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                </span>
              ))}
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default DevConTopTicker;
