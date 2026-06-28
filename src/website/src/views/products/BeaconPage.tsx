'use client';

import {
  FiActivity,
  FiBarChart2,
  FiDownload,
  FiMapPin,
  FiShield,
  FiWifi,
} from 'react-icons/fi';

import { getEnvironmentAwareUrl } from '@/lib/environmentAwareUrl';

import ProductMarketingPage from './ProductMarketingPage';

const beaconTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-blue-50',
  capabilitiesBackgroundClassName: 'bg-[#EDF3FF]',
  audiencesBackgroundClassName: 'bg-[#F5FAFF] border border-blue-100',
  ctaBackgroundClassName:
    'bg-gradient-to-br from-white via-blue-50 to-green-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const BeaconPage = () => {
  return (
    <ProductMarketingPage
      theme={beaconTheme}
      hero={{
        breadcrumb: 'Our Products > Beacon',
        title:
          'Keep your air quality monitoring network visible, reliable, and easier to manage.',
        description:
          'Beacon helps air quality network management teams see what is happening across their air quality monitoring network in one place. From device status and uptime to collocation performance and site-level issues, Beacon makes it easier to spot problems early and ensure data reliability.',
        image: {
          src: '/assets/images/products/beacon/beacon-home.webp',
          alt: 'Beacon hardware device render mounted under a solar panel',
        },
      }}
      intro={{
        title: (
          <>
            Turn{' '}
            <span className={beaconTheme.accentTextClassName}>
              network health
            </span>{' '}
            into a daily operating signal
          </>
        ),
        description: (
          <>
            <p>
              As air quality monitoring networks grow across African cities,
              sensor issues can quickly become data gaps. A monitor may go
              offline, a site may stop reporting, or a sensor may begin to
              perform differently from a reference monitor.
            </p>
            <p className="mt-4">
              Beacon gives operations, engineering, and data quality teams the
              visibility they need to understand which devices are working,
              which sites need attention, and where network performance is
              changing over time.
            </p>
          </>
        ),
      }}
      primarySection={{
        eyebrow: 'Operational visibility',
        title:
          'Know what is working, what is offline, and what needs attention',
        description: [
          'Beacon brings device status, deployment information, uptime, online and offline tracking, location details, and site performance into one air quality monitoring dashboard.',
          'This helps teams move from reactive troubleshooting to more planned network management, with clearer information on where to act, what to prioritize, and how to keep the network reliable over time.',
        ],
        image: {
          src: '/assets/images/products/beacon/beacon-dashboard-showcase.png',
          alt: 'Beacon device monitoring dashboard product showcase',
        },
        cardBackgroundClassName: 'bg-[#EEF8F1]',
        action: {
          label: 'Get started on Beacon',
          href: getEnvironmentAwareUrl(
            'https://beacon.airqo.net/dashboard/maintenance',
          ),
          variant: 'secondary',
        },
      }}
      capabilities={{
        title: (
          <>
            What you get with{' '}
            <span className={beaconTheme.accentTextClassName}>Beacon</span>
          </>
        ),
        description:
          'Beacon is designed for the everyday work of managing air quality monitoring networks. It helps teams track device health, review site performance, support collocation management, and understand whether the network is reliable enough to support research, public communication, and decision-making.',
        items: [
          {
            title: 'Device health dashboard',
            description:
              'See the status of devices across your network, including deployed devices, tracked devices, online devices, offline devices, and devices that may need follow-up.',
            Icon: FiActivity,
          },
          {
            title: 'Site and network visibility',
            description:
              'Understand where devices are located, which sites are active, and where performance issues are happening across cities and monitoring sites.',
            Icon: FiMapPin,
          },
          {
            title: 'Online and offline tracking',
            description:
              'Quickly identify devices that have gone offline, stopped reporting, or may be affecting data availability across the network.',
            Icon: FiWifi,
          },
          {
            title: 'Collocation site review',
            description:
              'Review how low-cost air quality sensors are performing alongside reference monitors, including site uptime, error margin, correlation, and reference monitor status.',
            Icon: FiShield,
          },
          {
            title: 'Performance analysis',
            description:
              'Compare performance across devices to see where the network is stable and where recurring issues may need attention.',
            Icon: FiBarChart2,
          },
          {
            title: 'Reports and exports',
            description:
              'Use downloadable reports and performance summaries to support planning, maintenance, internal reviews, and long-term network management.',
            Icon: FiDownload,
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Quality and collocation',
        title: 'Protect data quality before problems spread across the network',
        description: [
          'Reliable air quality data depends on more than deploying devices. Teams also need to know whether devices are performing as expected, whether reference monitors are reporting, and whether low-cost sensors remain aligned with reference grade monitors.',
          'Beacon supports collocation management by helping teams compare low-cost sensors with reference monitors at site level. This makes it easier to identify performance concerns early, support calibration workflows, and maintain confidence in the air quality data produced by the network.',
        ],
        image: {
          src: '/assets/images/products/beacon/person-call.webp',
          alt: 'Beacon hardware render used on the product page',
        },
        cardBackgroundClassName: 'bg-[#FFF7E8]',
        reverse: true,
        action: {
          label: 'Open site collocation',
          href: getEnvironmentAwareUrl(
            'https://beacon.airqo.net/dashboard/collocation/site',
          ),
          variant: 'secondary',
        },
      }}
      ctaSection={{
        eyebrow: 'AirQo Beacon',
        title: (
          <>
            Keep your network healthy, visible, and easier to manage at{' '}
            <span className={beaconTheme.accentTextClassName}>scale</span>
          </>
        ),
        description:
          'Open Beacon to review device health, track site performance, inspect collocation workflows, and maintain stronger operational control across your air quality monitoring network.',
        actions: [
          {
            label: 'Get Started on Beacon',
            href: getEnvironmentAwareUrl('https://beacon.airqo.net'),
          },
          {
            label: 'Download Health Reports',
            href: getEnvironmentAwareUrl(
              'https://beacon.airqo.net/dashboard/reports',
            ),
            variant: 'secondary',
          },
        ],
        quickLinks: [
          {
            title: 'Device Map',
            description:
              'See where devices are deployed and understand maintenance and availability context across the network.',
            href: getEnvironmentAwareUrl(
              'https://beacon.airqo.net/dashboard/maintenance',
            ),
          },
          {
            title: 'Cohort Analysis',
            description:
              'Compare groups of devices to identify recurring performance trends, reliability issues, and areas that may need follow-up.',
            href: getEnvironmentAwareUrl(
              'https://beacon.airqo.net/dashboard/analytics?analysis=cohorts',
            ),
          },
          {
            title: 'Automatic Reports',
            description:
              'Use recurring health and performance reports to maintain operational awareness over time.',
            href: getEnvironmentAwareUrl(
              'https://beacon.airqo.net/dashboard/reports',
            ),
          },
        ],
      }}
    />
  );
};

export default BeaconPage;
