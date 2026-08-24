'use client';

import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiHeart,
  FiMapPin,
  FiTrendingUp,
} from 'react-icons/fi';

import AppDownloadSection from '@/features/home/AppDownloadSection';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import ProductMarketingPage from './ProductMarketingPage';

const images = {
  hero: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741695567/website/photos/OurProducts/MobileApp/image7_fjjnl0.jpg',
    { width: 1000 },
  ),
  mockup: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
    { width: 800 },
  ),
  alerts: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741695590/website/photos/OurProducts/MobileApp/image25_htllpb.jpg',
    { width: 1200 },
  ),
  realtime: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/MobileApp/section-2_vgl9ey.webp',
    { width: 1200 },
  ),
};

const mobileTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-[#FFF8EE]',
  capabilitiesBackgroundClassName: 'bg-[#EDF3FF]',
  audiencesBackgroundClassName: 'bg-[#F5FAFF] border border-blue-100',
  ctaBackgroundClassName:
    'bg-gradient-to-br from-white via-indigo-50 to-blue-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const MobilePage = () => {
  return (
    <>
      <ProductMarketingPage
        theme={mobileTheme}
        hero={{
          breadcrumb: 'Our Products / Mobile App',
          title: 'Discover the quality of air around you.',
          description:
            'Access to reliable air quality data is the first step to protecting yourself against air pollution. The AirQo Mobile App is easy to use and free to download, allowing you to stay up-to-date on the quality of the air you are breathing.',
          image: {
            src: images.hero,
            alt: 'Discover the quality of air around you',
          },
          actions: [
            {
              label: 'Download on the App Store',
              href: 'https://apps.apple.com/ug/app/airqo-air-quality/id1337573091',
            },
            {
              label: 'Get it on Google Play',
              href: 'https://play.google.com/store/apps/details?id=com.airqo.app',
              variant: 'secondary',
            },
          ],
        }}
        intro={{
          title: (
            <>
              Know your{' '}
              <span className={mobileTheme.accentTextClassName}>Air</span>
            </>
          ),
          description: (
            <>
              <p>
                The AirQo Mobile App is the first of its kind in Africa. With
                the App, you have access to real-time and forecast air quality
                information from monitored urban areas across major cities in
                Africa.
              </p>
            </>
          ),
        }}
        primarySection={{
          eyebrow: 'Personalized alerts',
          title: 'Personalized air quality alerts and notifications',
          description: [
            'Receive personalized air quality alerts and recommendations to empower you to take action and stay healthy.',
            'Set up your favourite places to quickly check the quality of air in areas that matter to you. Turn on the notifications to know the quality of the air you are breathing.',
          ],
          image: {
            src: images.alerts,
            alt: 'Personalized air quality alerts',
          },
          cardBackgroundClassName: 'bg-gray-100',
        }}
        capabilities={{
          title: (
            <>
              What you get with the{' '}
              <span className={mobileTheme.accentTextClassName}>
                AirQo Mobile App
              </span>
            </>
          ),
          description:
            'The AirQo Mobile App gives you the power to make informed decisions about your daily activities based on the quality of the air you breathe.',
          items: [
            {
              title: 'Personalized alerts',
              description:
                'Receive personalized air quality alerts and recommendations to empower you to take action and stay healthy.',
              Icon: FiAlertCircle,
            },
            {
              title: 'Real-time air quality data',
              description:
                'Access real-time air quality information at the palm of your hands, giving you the power to make informed decisions.',
              Icon: FiActivity,
            },
            {
              title: '24-hour forecast',
              description:
                'Our 24-hour air quality forecast developed using Machine Learning and AI provides you with the power to better plan your day.',
              Icon: FiClock,
            },
            {
              title: 'Health tips',
              description:
                'Access detailed information and frequent tips to help you stay healthy and learn how you can reduce your exposure to air pollution.',
              Icon: FiHeart,
            },
            {
              title: 'Favorite places',
              description:
                'Set up your favourite places to quickly check the quality of air in areas that matter to you.',
              Icon: FiMapPin,
            },
            {
              title: 'Trend tracking',
              description:
                'Track air quality trends over time to understand patterns and make better decisions about outdoor activities.',
              Icon: FiTrendingUp,
            },
          ],
        }}
        secondarySection={{
          eyebrow: 'Real-time and forecast',
          title: 'Plan your day with air quality data',
          description: [
            'Our App gives you access to real-time and forecast air quality information at the palm of your hands, giving you the power to make informed decisions about your daily activities.',
            'Our 24-hour air quality forecast developed using Machine Learning and AI provides you with the power to better plan your day, know when to take a walk or a jog to avoid air pollution and stay healthy.',
          ],
          image: {
            src: images.realtime,
            alt: 'Real-time and forecast',
          },
          cardBackgroundClassName: 'bg-gray-100',
          reverse: true,
        }}
        ctaSection={{
          eyebrow: 'AirQo Mobile App',
          title: (
            <>
              Discover the quality of air{' '}
              <span className={mobileTheme.accentTextClassName}>
                you are breathing
              </span>
            </>
          ),
          description:
            'Download the AirQo Mobile App to stay up-to-date on the quality of the air you are breathing. Free to download and easy to use.',
          actions: [],
          quickLinks: [
            {
              title: 'AirQo Nexus',
              description:
                'Access the web dashboard for detailed air quality data and analytics.',
              href: 'https://nexus.airqo.net/',
            },
          ],
        }}
      />
      <AppDownloadSection
        title="Download the app"
        description="Discover the quality of air you are breathing"
        appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
        googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
        mockupImage={images.mockup}
      />
    </>
  );
};

export default MobilePage;
