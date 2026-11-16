import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

const STORE_BADGE_WIDTH = 320;
const MOCKUP_WIDTH = 800;

const storeBadges = {
  appStore: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179257/website/photos/apple_vpcn6j.png',
    { width: STORE_BADGE_WIDTH },
  ),
  googlePlay: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179280/website/photos/google_play_vdmjrx.png',
    { width: STORE_BADGE_WIDTH },
  ),
};

const defaultMockupImage = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
  { width: MOCKUP_WIDTH },
);

interface AppDownloadSectionProps {
  title?: string;
  description?: string;
  appStoreLink?: string;
  googlePlayLink?: string;
  mockupImage?: string;
}

const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
  title = 'Download the app',
  description = 'Discover the quality of air you are breathing',
  appStoreLink = '#',
  googlePlayLink = '#',
  mockupImage = defaultMockupImage,
}) => {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
              AirQo mobile app
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-7 text-gray-600">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={appStoreLink}
                className="transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={storeBadges.appStore}
                  alt="Download on the App Store"
                  width={140}
                  height={45}
                  className="h-auto w-[140px] object-contain"
                  loading="lazy"
                />
              </a>
              <a
                href={googlePlayLink}
                className="transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={storeBadges.googlePlay}
                  alt="Get it on Google Play"
                  width={140}
                  height={45}
                  className="h-auto w-[140px] object-contain"
                  loading="lazy"
                />
              </a>
            </div>

            <Link
              href="/products/mobile-app"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Explore the app
              <FiArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="min-w-0">
            <div className="rounded-md border border-line bg-brand-50 px-6 py-10 sm:px-10">
              <div className="relative mx-auto w-[240px] sm:w-[280px]">
                <div className="relative aspect-[1/2]">
                  <Image
                    src={mockupImage}
                    alt="AirQo app interface preview"
                    fill
                    sizes="(max-width: 1024px) 60vw, 280px"
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
