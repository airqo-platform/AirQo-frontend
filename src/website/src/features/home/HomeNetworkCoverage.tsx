'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const { data, isLoading, error, refetch } = useNetworkCoverageImpact({
    tenant: 'airqo',
    network: 'airqo',
  });
  const impact = data?.impact;
  const scrollRef = useRef<HTMLUListElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const countries = useMemo<ImpactCountryEntry[]>(() => {
    return (impact?.byCountry ?? [])
      .filter((c: ImpactCountryEntry) => c.total > 0)
      .sort(
        (a: ImpactCountryEntry, b: ImpactCountryEntry) =>
          b.total - a.total || a.country.localeCompare(b.country),
      );
  }, [impact]);

  // Auto-rotate the country carousel on an interval.
  useEffect(() => {
    if (countries.length <= 1 || isPaused) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, clientWidth, scrollWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollTo({
          left: scrollLeft + CARD_SCROLL_STEP,
          behavior: 'smooth',
        });
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [countries.length, isPaused]);

  const totalMonitors =
    impact?.totalMonitors ?? countries.reduce((sum, c) => sum + c.total, 0);
  const totalCountries =
    impact?.totalCountries && impact.totalCountries > 0
      ? impact.totalCountries
      : countries.length;
  const totalCities = impact?.totalCities ?? 0;

  const scrollByCard = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({
      left: direction * CARD_SCROLL_STEP,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto min-h-[26rem] max-w-7xl animate-pulse rounded-2xl bg-[#0B1B3A]/20 px-4" />
    );
  }

  if (error) {
    return (
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-br from-[#0B1B3A] via-[#10265A] to-[#0B1B3A] px-6 py-12 text-white md:px-12 md:py-16">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-100">
            Network coverage
          </span>
          <h2 className="mt-4 text-3xl font-bold lg:text-4xl">
            AirQo&apos;s monitoring network across Africa
          </h2>
          <p className="mt-4 text-blue-100">
            We couldn&apos;t load live network coverage right now.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/solutions/network-coverage"
              className="inline-flex items-center gap-2 font-medium text-white underline-offset-4 hover:underline"
            >
              View full network coverage →
            </Link>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-white/25 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="network-coverage-heading"
      className="px-4 py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-br from-[#0B1B3A] via-[#10265A] to-[#0B1B3A] px-6 py-12 text-white md:px-12 md:py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-100">
              Network coverage
            </span>
            <h2
              id="network-coverage-heading"
              className="text-3xl font-bold lg:text-4xl"
            >
              AirQo&apos;s monitoring network across Africa
            </h2>
            <p className="text-blue-100">
              Explore where our monitors are deployed across Africa.
            </p>
          </div>
          <Link
            href="/solutions/network-coverage"
            className="inline-flex w-fit rounded-lg border border-white/25 px-5 py-2.5 font-medium hover:bg-white/10"
          >
            View full network coverage
          </Link>
        </div>

        {countries.length === 0 ? (
          <p className="mt-8 text-blue-100">
            Live network coverage data is not available right now.
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-8">
              <div>
                <p className="text-3xl font-bold md:text-4xl">
                  {formatNumber(totalMonitors)}
                </p>
                <p className="text-sm text-blue-100">Total monitors</p>
              </div>
              <div>
                <p className="text-3xl font-bold md:text-4xl">
                  {formatNumber(totalCountries)}
                </p>
                <p className="text-sm text-blue-100">Countries</p>
              </div>
              <div>
                <p className="text-3xl font-bold md:text-4xl">
                  {formatNumber(totalCities)}
                </p>
                <p className="text-sm text-blue-100">Cities</p>
              </div>
            </div>

            {countries.length > 1 && (
              <div className="mt-8 flex items-center justify-end gap-2">
                <button
                  type="button"
                  aria-label="Previous countries"
                  onClick={() => scrollByCard(-1)}
                  className="rounded-full border border-white/25 p-2 hover:bg-white/10"
                >
                  <HiArrowSmallLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next countries"
                  onClick={() => scrollByCard(1)}
                  className="rounded-full border border-white/25 p-2 hover:bg-white/10"
                >
                  <HiArrowSmallRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {countries.length > 0 && (
              <div
                className="relative mt-6"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocusCapture={() => setIsPaused(true)}
                onBlurCapture={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0B1B3A] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#0B1B3A] to-transparent" />

                <ul
                  ref={scrollRef}
                  role="region"
                  aria-label="Network coverage by country"
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {countries.map((country) => (
                    <li
                      key={country.iso2 || country.country}
                      className="w-[200px] shrink-0 snap-start rounded-xl bg-white p-5 text-[#0B1B3A] sm:w-[220px]"
                    >
                      {isValidIso2(country.iso2) ? (
                        <Image
                          src={getFlagUrl(country.iso2)}
                          alt=""
                          aria-hidden="true"
                          width={32}
                          height={24}
                          unoptimized
                          className="h-6 w-8 rounded-sm object-cover shadow-sm"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {country.iso2 || '—'}
                        </span>
                      )}
                      <p className="mt-2 truncate text-base font-semibold">
                        {country.country}
                      </p>
                      <p className="text-2xl font-bold text-[#145DFF]">
                        {formatNumber(country.total)}
                      </p>
                      <p className="text-sm text-gray-600">sensors</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HomeNetworkCoverage;
