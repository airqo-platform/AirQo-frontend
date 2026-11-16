import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

import { partnerLogos } from './data';

const STATS = [
  { value: '16', label: 'Cities' },
  { value: '500+', label: 'Monitors' },
  { value: '30M+', label: 'People reached' },
  { value: '9', label: 'Countries' },
  { value: '100+', label: 'Research papers' },
  { value: '20+', label: 'Partners' },
] as const;

const HomeStatsSection = () => (
  <section className="bg-surface-muted px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
            Impact
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Evidence you can use.
          </h2>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/solutions/african-cities"
            className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            For African cities
            <FiArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href="/solutions/communities"
            className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            For communities
            <FiArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="min-w-0 border-t border-line pt-5">
            <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
          Supported by
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-6">
          {partnerLogos.map((logo, index) => (
            <div key={index} className="relative h-8 w-24">
              <Image
                src={logo}
                alt="AirQo partner logo"
                fill
                unoptimized
                sizes="96px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HomeStatsSection;
