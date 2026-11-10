'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { HiArrowSmallLeft, HiArrowSmallRight } from 'react-icons/hi2';

import type { ImpactCountryEntry } from '@/features/solutions/network-coverage/networkCoverageTypes';
import { useNetworkCoverageImpact } from '@/hooks/useApiHooks';
import { getFlagUrl } from '@/lib/utils/languages';

const numberFormatter = new Intl.NumberFormat('en-US');

const isValidIso2 = (iso2: string): boolean => /^[A-Za-z]{2}$/.test(iso2);

const formatNumber = (value: number | undefined | null): string =>
  numberFormatter.format(value ?? 0);

const CARD_SCROLL_STEP = 240;

const HomeNetworkCoverage = () => {
  // Match the full dashboard's tenant scope without limiting results to
  // AirQo's network, so the homepage reflects the broader monitoring view.
  const { data, isLoading, error, refetch } = useNetworkCoverageImpact({
    tenant: 'airqo',
  });
  const impact = data?.impact;
  const scrollRef = useRef<HTMLUListElement>(null);

  const countries = useMemo<ImpactCountryEntry[]>(() => {
    return (impact?.byCountry ?? [])
      .filter((c: ImpactCountryEntry) => c.total > 0)
      .sort(
        (a: ImpactCountryEntry, b: ImpactCountryEntry) =>
          b.total - a.total || a.country.localeCompare(b.country),
      );
  }, [impact]);

  const scrollByCard = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({
      left: direction * CARD_SCROLL_STEP,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto min-h-[26rem] max-w-7xl animate-pulse rounded-md border border-line bg-surface-muted" />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="network-coverage-heading"
      className="px-4 py-12 sm:px-6 md:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl rounded-md border border-line bg-surface-muted p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
              Network coverage
            </p>
            <h2
              id="network-coverage-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-ink lg:text-4xl"
            >
              Air quality monitoring across Africa
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Explore air quality monitors and networks across the continent.
            </p>
            <Link
              href="/solutions/network-coverage"
              className="mt-8 inline-flex w-fit max-w-full items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Discover network coverage
              <FiArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="min-w-0">
            {error ? (
              <div className="flex h-full flex-col items-start justify-center gap-3">
                <p className="text-lg font-semibold text-ink">
                  16 cities · 9 countries
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  Live network coverage is unavailable right now.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-sm text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Try again
                </button>
              </div>
            ) : countries.length === 0 ? (
              <div className="flex h-full flex-col items-start justify-center gap-3">
                <p className="text-lg font-semibold text-ink">
                  16 cities · 9 countries
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  Network coverage details are not available right now.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
                    Explore by country
                  </p>
                  {countries.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous countries"
                        onClick={() => scrollByCard(-1)}
                        className="rounded-md border border-line bg-white p-2 text-ink transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <HiArrowSmallLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next countries"
                        onClick={() => scrollByCard(1)}
                        className="rounded-md border border-line bg-white p-2 text-ink transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <HiArrowSmallRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <ul
                  ref={scrollRef}
                  role="region"
                  aria-label="Network coverage by country"
                  className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {countries.map((country) => (
                    <li
                      key={country.iso2 || country.country}
                      className="w-[180px] shrink-0 snap-start rounded-md border border-line bg-white p-4 sm:w-[200px]"
                    >
                      {isValidIso2(country.iso2) ? (
                        <Image
                          src={getFlagUrl(country.iso2)}
                          alt=""
                          aria-hidden="true"
                          width={32}
                          height={24}
                          unoptimized
                          className="h-6 w-8 rounded-sm object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-ink">
                          {country.iso2 || '—'}
                        </span>
                      )}
                      <p className="mt-3 break-words text-sm font-semibold text-ink">
                        {country.country}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-brand">
                        {formatNumber(country.total)}
                      </p>
                      <p className="text-xs text-gray-500">sensors</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeNetworkCoverage;
