'use client';

import {
  FiClock,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiLifeBuoy,
} from 'react-icons/fi';

import { API_CONSOLE_URL } from '@/config/console.config';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import ApiFaqSection from './components/ApiFaqSection';
import ApiPlansSection from './components/ApiPlansSection';
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
        title: 'Build with air quality data.',
        description:
          'Build with real-time, historical, and forecast air quality data from African cities.',
        image: {
          src: images.hero,
          alt: 'AirQo API - African air quality data API for developers',
        },
        actions: [
          {
            label: 'Open API Console',
            href: API_CONSOLE_URL,
          },
          {
            label: 'Read the docs',
            href: API_DOCS_URL,
            variant: 'secondary',
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
          'Our comprehensive air quality datasets include data from our low-cost air quality monitors as well as reference-grade monitors strategically deployed in major African cities.',
        ],
        image: {
          src: images.dataAccess,
          alt: 'AirQo API data access interface for African air quality developers',
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
            title: 'Comprehensive datasets',
            description:
              'Combine data from our low-cost air quality monitors with reference-grade monitors strategically deployed in major African cities.',
            Icon: FiDatabase,
          },
          {
            title: 'Real-time, historical, and forecast data',
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
      ctaSection={{
        eyebrow: 'AirQo API',
        title: (
          <>
            Ready to build with{' '}
            <span className={apiTheme.accentTextClassName}>AirQo API</span>?
          </>
        ),
        description:
          'Open the Console to create a client, choose a plan, and start building.',
        actions: [
          {
            label: 'Open API Console',
            href: API_CONSOLE_URL,
          },
          {
            label: 'Read the docs',
            href: API_DOCS_URL,
            variant: 'secondary',
          },
        ],
      }}
    >
      <ApiPlansSection />
      <ApiFaqSection />
    </ProductMarketingPage>
  );
};

export default ApiPage;
