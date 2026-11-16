import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import mainConfig from '@/config/site.config';

const HomeCTA = () => (
  <section className="bg-white py-14 sm:py-16">
    <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
      <div className="rounded-md border border-brand-100 bg-brand-50 px-6 py-12 sm:px-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
            Work with AirQo
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Bring better air quality data to your city.
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-700">
            Whether you need a monitoring network, a data partnership, or a
            public air quality tool, the AirQo team can help you choose the
            right combination.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Talk to AirQo
            <FiArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <a
            href="https://ai.airqo.net/map"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="See live air quality map (opens in a new tab)"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            See live air quality
            <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default HomeCTA;
