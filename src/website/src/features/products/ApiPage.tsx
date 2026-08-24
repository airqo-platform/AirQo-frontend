'use client';

import Image from 'next/image';
import React from 'react';
import {
  FiClock,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiLifeBuoy,
  FiWind,
} from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import ProductMarketingPage from './ProductMarketingPage';

const API_DOCS_URL = 'https://platform.airqo.net/docs/api/intro/';

const images = {
  hero: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1755105828/website/photos/OurProducts/Api/AirQo_API_hero_eoosnz.webp',
    { width: 1000 },
  ),
  dataAccess: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1755105658/website/photos/OurProducts/Api/Air_quality_API_t0blnw.webp',
    { width: 1200 },
  ),
  console: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1755105933/website/photos/OurProducts/Api/AirQo_API_nky6xb.webp',
    { width: 1200 },
  ),
  interface: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Api/section-3_uwtkrz.webp',
    { width: 1200 },
  ),
};

const apiTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-yellow-50',
  capabilitiesBackgroundClassName: 'bg-blue-50',
  audiencesBackgroundClassName: 'bg-[#F5FAFF] border border-blue-100',
  ctaBackgroundClassName:
    'bg-gradient-to-br from-white via-yellow-50 to-blue-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const ApiPage = () => {
  return (
    <ProductMarketingPage
      theme={apiTheme}
      hero={{
        breadcrumb: 'Our Products / AirQo API',
        title: 'Access real-time air quality data.',
        description:
          'Designed to effortlessly enhance your application with vital insights, embrace the transformative potential of air quality information through our API.',
        image: {
          src: images.hero,
          alt: 'AirQo API - African air quality data API for developers',
        },
        actions: [
          {
            label: 'Get the API',
            href: API_DOCS_URL,
          },
        ],
      }}
      intro={{
        title: (
          <>
            Unlock Air Quality{' '}
            <span className={apiTheme.accentTextClassName}>Insights</span>
          </>
        ),
        description:
          'The AirQo API provides open access to a vast repository of over 10 million records of raw and calibrated real-time, historical, and forecast air quality data.',
      }}
      primarySection={{
        eyebrow: 'Data access',
        title: 'Redefining data access',
        description: [
          'The API uses AI and data analysis techniques to provide accurate air quality measurements. It offers PM2.5 and PM10 measurements, the most common pollutants in African cities.',
          'Our comprehensive air quality datasets include data from our low-cost air quality monitors as well as reference-grade monitors strategically deployed in major African Cities.',
        ],
        image: {
          src: images.dataAccess,
          alt: 'AirQo API - African air quality data API for developers, redefining data access',
        },
        cardBackgroundClassName: 'bg-gray-100',
      }}
      capabilities={{
        title: (
          <>
            What you can do with the{' '}
            <span className={apiTheme.accentTextClassName}>AirQo API</span>
          </>
        ),
        description:
          'Everything you need to integrate accurate air quality information into your application, from measurement data to developer support.',
        items: [
          {
            title: 'AI-powered accuracy',
            description:
              'The API uses AI and data analysis techniques to provide accurate air quality measurements.',
            Icon: FiCpu,
          },
          {
            title: 'PM2.5 and PM10 measurements',
            description:
              'Track the most common pollutants in African cities with measurements for PM2.5 and PM10 particulate matter.',
            Icon: FiWind,
          },
          {
            title: 'Comprehensive datasets',
            description:
              'Combine data from our low-cost air quality monitors with reference-grade monitors strategically deployed in major African cities.',
            Icon: FiDatabase,
          },
          {
            title: 'Real-time, historical and forecast data',
            description:
              'Work with raw and calibrated air quality data across real-time, historical, and forecast time horizons.',
            Icon: FiClock,
          },
          {
            title: 'Comprehensive documentation',
            description:
              'Seamlessly integrate the data with guidance from detailed API documentation.',
            Icon: FiFileText,
          },
          {
            title: 'Dedicated support team',
            description:
              'Get assistance at every step of the integration process from a team that knows the API inside out.',
            Icon: FiLifeBuoy,
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Empowering action',
        title: 'Start empowering your audience',
        description: [
          "The AirQo API is not only about air quality data—it's about empowering users to take action to protect themselves against air pollution.",
          'Integrate air quality information in your Open Source Projects, Browser Extensions, Plugins, Mobile Apps, Desktop and Web Apps. Help users take charge of their health and join the movement for cleaner air!',
        ],
        image: {
          src: images.console,
          alt: 'API Console Data - AirQo API for African air quality data developers',
          width: 600,
          height: 400,
        },
        cardBackgroundClassName: 'bg-yellow-50',
        reverse: true,
      }}
      childrenAfterSecondary
    >
      <section className="bg-blue-100 py-16 px-4 overflow-hidden">
        <div className={`${mainConfig.containerClass} space-y-8`}>
          <div className="text-center flex flex-col items-center space-y-6">
            <h2 className="text-[32px] font-bold text-gray-900">
              <span className="text-blue-700">How</span> it works
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              With our API, you have access to comprehensive documentation to
              enable you seamlessly integrate the data, and a dedicated support
              team to assist you at every step of the integration process.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <Image
              src={images.interface}
              alt="Easy-to-use AirQo API interface for African air quality data developers"
              width={1200}
              height={600}
              className="rounded-lg w-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>
    </ProductMarketingPage>
  );
};

export default ApiPage;
