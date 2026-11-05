'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiArrowRight, FiArrowUpRight, FiExternalLink } from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { getExternalLinkProps } from '@/lib/security/safeExternalLink';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

type ExploreLink = {
  href: string;
  external?: boolean;
};

type FeatureLink = ExploreLink & {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const isExternalLink = (item: ExploreLink) =>
  item.external || item.href.startsWith('http');

const SmartLink: React.FC<
  ExploreLink & {
    children: React.ReactNode;
    className?: string;
  }
> = ({ href, external, children, className = '' }) => {
  if (isExternalLink({ href, external })) {
    return (
      <a href={href} {...getExternalLinkProps(href)} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

const featureLinks: FeatureLink[] = [
  {
    title: 'AirQo Nexus',
    description:
      'Explore live and historical air quality readings from monitoring networks across Africa.',
    href: 'https://nexus.airqo.net/',
    external: true,
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175853/website/photos/analyticsHome_l3hgcy.png',
      { width: 1000 },
    ),
    imageAlt: 'AirQo air quality analytics platform',
  },
  {
    title: 'AirQo Mobile App',
    description:
      'Check local air quality and get practical information on your phone.',
    href: '/products/mobile-app',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
      { width: 800 },
    ),
    imageAlt: 'AirQo mobile app home screen',
  },
  {
    title: 'Binos Monitor',
    description:
      'Learn about locally built monitors designed for air quality measurement in African cities.',
    href: '/products/monitor',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757020397/website/photos/monitorHome_dmmrsk_tof2wo.webp',
      { width: 1000 },
    ),
    imageAlt: 'AirQo Binos air quality monitor',
  },
];

const productLinks = [
  { title: 'Binos Monitor', href: '/products/monitor' },
  { title: 'AirQo Beacon', href: '/products/beacon' },
  { title: 'AirQalibrate', href: '/products/calibrate' },
  { title: 'AirQo Nexus', href: '/products/nexus' },
  { title: 'AirQo Vertex', href: '/products/vertex' },
  { title: 'AirQo AI Platform', href: '/products/ai-platform' },
  { title: 'AirQo Mobile App', href: '/products/mobile-app' },
  { title: 'Air Quality API', href: '/products/api' },
];

const resourceLinks = [
  {
    title: 'Technical documentation',
    description: 'Specifications and implementation material',
    href: '/resources?tab=technical',
  },
  {
    title: 'Research & publications',
    description: 'Evidence and findings from AirQo',
    href: '/resources?tab=research',
  },
  {
    title: 'Guides & manuals',
    description: 'Practical guidance for AirQo tools and hardware',
    href: '/resources?tab=guide,manual',
  },
];

const ExplorePage = () => (
  <div className="w-full overflow-hidden bg-white text-gray-900">
    <section className="border-b border-gray-200 bg-gray-50">
      <div
        className={`${mainConfig.containerClass} grid items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20`}
      >
        <div className="min-w-0">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            Explore AirQo
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Find the right way to explore air quality data.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-700">
            See what is happening now, understand trends, and choose the tools
            that fit your city, work, or research.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SmartLink
              href="https://nexus.airqo.net/"
              external
              className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Explore live data <FiArrowUpRight aria-hidden="true" />
            </SmartLink>
            <SmartLink
              href="https://ai.airqo.net/map"
              external
              className="inline-flex items-center justify-center gap-2 border border-gray-800 bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              View the live map <FiArrowUpRight aria-hidden="true" />
            </SmartLink>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/products/mobile-app"
              className="font-medium text-gray-800 underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Get the mobile app
            </Link>
            <Link
              href="/products/api"
              className="font-medium text-gray-800 underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Build with the API
            </Link>
            <Link
              href="/resources?tab=technical"
              className="font-medium text-gray-800 underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Read documentation
            </Link>
          </div>
        </div>

        <figure className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-lg bg-gray-200">
          <Image
            src={optimizeCloudinaryUrl(
              'https://res.cloudinary.com/dbibjvyhm/image/upload/v1743546958/website/photos/OurProducts/Monitor/Two_members_in_field_knwffk.jpg',
              { width: 1100 },
            )}
            alt="AirQo team members working in the field"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-black/65 px-4 py-3 text-sm text-white">
            Air quality monitoring in the field
          </figcaption>
        </figure>
      </div>
    </section>

    <section
      aria-labelledby="featured-tools-heading"
      className={`${mainConfig.containerClass} px-4 py-14 sm:py-16`}
    >
      <div className="max-w-2xl">
        <h2
          id="featured-tools-heading"
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
        >
          Start with AirQo data and tools
        </h2>
        <p className="mt-4 text-lg leading-7 text-gray-700">
          Browse the live platform, get air quality information on your phone,
          or learn about the monitors behind the data.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {featureLinks.map((item) => (
          <article
            key={item.title}
            className="flex min-w-0 flex-col border border-gray-200 bg-white"
          >
            <SmartLink
              href={item.href}
              external={item.external}
              className="relative block aspect-[4/3] overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
            >
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            </SmartLink>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-gray-700">
                {item.description}
              </p>
              <SmartLink
                href={item.href}
                external={item.external}
                className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {item.title === 'AirQo Nexus'
                  ? 'Explore live data'
                  : `Explore ${item.title}`}
                {item.external ? (
                  <FiExternalLink aria-hidden="true" />
                ) : (
                  <FiArrowRight aria-hidden="true" />
                )}
              </SmartLink>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section
      id="product-directory"
      className="border-y border-gray-200 bg-gray-50"
    >
      <div className={`${mainConfig.containerClass} px-4 py-14 sm:py-16`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              One place to find every AirQo tool
            </h2>
            <p className="mt-3 max-w-2xl text-gray-700">
              Find tools for monitoring, data quality, analysis, sharing, and
              development.
            </p>
          </div>
          <Link
            href="#product-directory"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Browse all products <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {productLinks.map((item) => (
            <li key={item.href} className="border-t border-gray-300">
              <Link
                href={item.href}
                className="flex min-h-14 items-center justify-between gap-3 py-3 font-medium text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {item.title}
                <FiArrowRight
                  aria-hidden="true"
                  className="shrink-0 text-gray-600"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section
      aria-labelledby="resources-heading"
      className={`${mainConfig.containerClass} px-4 py-14 sm:py-16`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id="resources-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            Documents, evidence, and practical guidance
          </h2>
          <p className="mt-3 text-gray-700">
            Read AirQo documentation, research, and guides for using the data
            and tools.
          </p>
        </div>
        <Link
          href="/resources"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Browse all resources <FiArrowRight aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {resourceLinks.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group block h-full border border-gray-200 p-5 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-800 underline underline-offset-4">
                View resources <FiArrowRight aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>

    <section className="border-t border-gray-200 bg-gray-50">
      <div
        className={`${mainConfig.containerClass} flex flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Need help finding the right tool?
          </h2>
          <p className="mt-1 text-gray-700">
            Talk to the AirQo team about your data needs.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex w-fit items-center gap-2 bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Contact AirQo <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  </div>
);

export default ExplorePage;
