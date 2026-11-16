import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import mainConfig from '@/config/site.config';

type Solution = {
  number: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const SOLUTIONS: Solution[] = [
  {
    number: '01',
    title: 'For African Cities',
    description:
      'Build a high-resolution monitoring network and give city leaders the evidence to manage air quality.',
    href: '/solutions/african-cities',
    cta: 'Explore city solutions',
  },
  {
    number: '02',
    title: 'For Communities',
    description:
      'Put timely, local air quality information in the hands of residents, leaders, and community groups.',
    href: '/solutions/communities',
    cta: 'Explore community solutions',
  },
  {
    number: '03',
    title: 'For Research',
    description:
      'Access curated datasets, APIs, and tools built for air quality research and analysis.',
    href: '/solutions/research',
    cta: 'Explore research tools',
  },
  {
    number: '04',
    title: 'Network Coverage',
    description:
      'See the monitors, cities, and networks that make up Africa’s air quality infrastructure.',
    href: '/solutions/network-coverage',
    cta: 'Open the coverage map',
  },
  {
    number: '05',
    title: 'Kampala Study',
    description:
      'Learn about AirQo’s Kampala air pollution exposure study and how to take part.',
    href: '/solutions/kampala-study',
    cta: 'Explore the study',
  },
];

const primaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const secondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const SolutionsPage = () => (
  <div className="w-full overflow-hidden bg-white text-ink">
    {/* Hero */}
    <section className="border-b border-line bg-white">
      <div
        className={`${mainConfig.containerClass} px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24`}
      >
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            AirQo solutions
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[56px]">
            Air quality data that leads to action.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            AirQo works with cities, communities, research teams, and monitoring
            networks to turn air quality measurements into information people
            can act on.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/contact" className={primaryButtonClassName}>
              Talk to AirQo
              <FiArrowRight aria-hidden="true" />
            </Link>
            <a
              href="https://ai.airqo.net/map"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="See live air quality map (opens in a new tab)"
              className={secondaryButtonClassName}
            >
              See live air quality
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* Solution cards */}
    <section
      aria-labelledby="solutions-heading"
      className="border-b border-line py-14 sm:py-16"
    >
      <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              All solutions
            </p>
            <h2
              id="solutions-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              Five ways to work with AirQo
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-gray-600">
              Pick the path that matches your work, then go deeper on each
              solution.
            </p>
          </div>
          <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
            {SOLUTIONS.length} solutions
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((solution) => (
            <article
              key={solution.href}
              className="flex flex-col rounded-md border border-line bg-white p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                {solution.number}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {solution.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
                {solution.description}
              </p>
              <Link
                href={solution.href}
                className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {solution.cta}
                <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section className="py-14 sm:py-16">
      <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
        <div className="rounded-md border border-brand-100 bg-brand-50 px-6 py-12 sm:px-10 lg:py-14">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
              Work with AirQo
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Not sure which solution fits?
            </h2>
            <p className="mt-4 text-lg leading-7 text-gray-700">
              Tell us about your city, community, or research project and the
              AirQo team will point you to the right solution.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/contact" className={primaryButtonClassName}>
              Talk to AirQo
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default SolutionsPage;
