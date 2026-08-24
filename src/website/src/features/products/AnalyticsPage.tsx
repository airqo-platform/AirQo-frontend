'use client';

import {
  FiBarChart2,
  FiGlobe,
  FiLayout,
  FiMapPin,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import ProductMarketingPage from './ProductMarketingPage';

const images = {
  header: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-header_csuujt.webp',
    { width: 1000 },
  ),
  timelyData: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/section-1_awoy4i.webp',
    { width: 1200 },
  ),
  insights: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/Analytics/section-2_xv8lnw.webp',
    { width: 1200 },
  ),
};

const nexusTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-blue-50',
  capabilitiesBackgroundClassName: 'bg-[#EFF6FF]',
  audiencesBackgroundClassName: 'bg-[#F5FAFF] border border-blue-100',
  ctaBackgroundClassName:
    'bg-gradient-to-br from-white via-blue-50 to-indigo-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const AnalyticsPage = () => {
  return (
    <ProductMarketingPage
      theme={nexusTheme}
      hero={{
        breadcrumb: 'Our Products / AirQo Nexus',
        title: 'Access and visualise air quality data in African Cities.',
        description:
          "If we can't measure air pollution, we can't manage it: Access, track, analyse and download insightful air quality data across major cities in Africa.",
        image: {
          src: images.header,
          alt: 'Access and visualise air quality data',
        },
        actions: [
          {
            label: 'Explore Data',
            href: 'https://nexus.airqo.net/',
          },
          {
            label: 'Documentation',
            href: 'https://platform.airqo.net/docs/nexus/intro/',
            variant: 'secondary',
          },
        ],
      }}
      intro={{
        title: (
          <>
            <span className={nexusTheme.accentTextClassName}>Real-time</span>{' '}
            air quality insights with AirQo Nexus for African Cities
          </>
        ),
        description: (
          <>
            Air pollution in many cities in Africa is under-monitored in part
            due to the logistical constraints of setting up and maintaining a
            monitoring network, coupled with the expertise to process and
            analyse data.
          </>
        ),
      }}
      primarySection={{
        eyebrow: 'Timely access',
        title: 'Timely access to data',
        description: [
          'AirQo Nexus is an intuitive software dashboard that allows you to have timely access to historic, real-time, and forecast actionable air quality information across our monitored urban spaces in Africa.',
          'We want to see citizens and decision-makers in African Cities have timely access to air quality trends, patterns, and insights to inform data-driven decisions to tackle air pollution.',
        ],
        image: {
          src: images.timelyData,
          alt: 'Timely access to data',
        },
        cardBackgroundClassName: 'bg-green-50',
      }}
      capabilities={{
        title: (
          <>
            What you can do with{' '}
            <span className={nexusTheme.accentTextClassName}>AirQo Nexus</span>
          </>
        ),
        description:
          'Our visualization charts are designed to help you easily interpret and gain insights into the data while giving you access to air quality trends in African Cities over time.',
        items: [
          {
            title: 'Visualize air quality data',
            description:
              'Access intuitive charts and visualizations that make it easy to interpret air quality data across monitored urban spaces in Africa.',
            Icon: FiBarChart2,
          },
          {
            title: 'Track trends over time',
            description:
              'Monitor air quality trends over time to understand patterns and changes across major African cities.',
            Icon: FiTrendingUp,
          },
          {
            title: 'Predictive insights',
            description:
              'Access AI and machine learning powered predictive insights, giving stakeholders historical, real-time, or forecast air quality data in locations that matter to them.',
            Icon: FiZap,
          },
          {
            title: 'Compare across cities',
            description:
              'Easily generate, download and compare air quality data across various African cities.',
            Icon: FiMapPin,
          },
          {
            title: 'Easy-to-use interface',
            description:
              'Navigate a simple and intuitive dashboard designed to give you quick access to the air quality information that matters most.',
            Icon: FiLayout,
          },
          {
            title: 'Open data access',
            description:
              'Download and share air quality data to support research, policy decisions, and clean air action.',
            Icon: FiGlobe,
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Predictive analytics',
        title: 'Gain insights to take action',
        description: [
          'We integrate AI and machine learning models to deliver predictive insights, giving stakeholders access to historical, real-time, or forecast air quality data in locations that matter to them. This empowers the stakeholders to make evidence-informed decisions to better manage air pollution.',
          'Easily generate, download and compare air quality data across various African cities and develop evidence-informed actions for air pollution.',
        ],
        image: {
          src: images.insights,
          alt: 'Gain insights to take action',
        },
        cardBackgroundClassName: 'bg-green-50',
        reverse: true,
      }}
      ctaSection={{
        eyebrow: 'AirQo Nexus',
        title: (
          <>
            Access and visualise air quality data to drive{' '}
            <span className={nexusTheme.accentTextClassName}>
              evidence-informed decisions
            </span>
          </>
        ),
        description:
          'Open AirQo Nexus to track, analyse and download insightful air quality data across major cities in Africa.',
        actions: [
          {
            label: 'Explore Data',
            href: 'https://nexus.airqo.net/',
          },
        ],
        quickLinks: [
          {
            title: 'Documentation',
            description:
              'Review setup and integration guidance for the AirQo Nexus platform.',
            href: 'https://platform.airqo.net/docs/nexus/intro/',
          },
          {
            title: 'Contact Us',
            description:
              'Get in touch with the AirQo team for support or partnership enquiries.',
            href: '/contact',
          },
        ],
      }}
    />
  );
};

export default AnalyticsPage;
