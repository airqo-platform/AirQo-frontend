'use client';

import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiMapPin,
  FiShield,
  FiTool,
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
          src: '/assets/images/products/beacon/beacon-device-render.webp',
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
            What teams can do with{' '}
            <span className={beaconTheme.accentTextClassName}>Beacon</span>
          </>
        ),
        description:
          'Beacon is designed for the operational layer of air quality monitoring, where support workflows, reliability indicators, and device quality directly affect the value of the network.',
        items: [
          {
            title: 'Device health dashboard',
            description:
              'Monitor device status in detail and respond faster to hardware or connectivity failures.',
            Icon: FiActivity,
          },
          {
            title: 'Performance analytics',
            description:
              'Review uptime, MTBF, MTTR, and related metrics to understand network reliability over time.',
            Icon: FiBarChart2,
          },
          {
            title: 'Collocation oversight',
            description:
              'Compare low-cost sensors and reference devices to support better data quality assurance.',
            Icon: FiShield,
          },
          {
            title: 'Maintenance context',
            description:
              'Use site and device-level visibility to prioritize maintenance work more effectively.',
            Icon: FiTool,
          },
          {
            title: 'Location awareness',
            description:
              'Understand where device issues are happening across the network and why they matter.',
            Icon: FiMapPin,
          },
          {
            title: 'Historical reporting',
            description:
              'Investigate recurring issues, long-term trends, and operational behavior with more confidence.',
            Icon: FiClock,
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Quality and collocation',
        title:
          'Support better collocation analysis and long-term device reliability',
        description: [
          'Beacon helps teams inspect collocation site behavior and compare low-cost sensors against reference devices before poor calibration or drift affects the overall quality of the network.',
          'It also supports broader operational review by making health logs and recurring performance issues easier to interpret over time.',
        ],
        image: {
          src: '/assets/images/products/beacon/person-call.webp',
          alt: 'Beacon hardware render used on the product page',
        },
        cardBackgroundClassName: 'bg-[#FFF7E8]',
        reverse: true,
        action: {
          label: 'Open Site Collocation',
          href: getEnvironmentAwareUrl(
            'https://beacon.airqo.net/dashboard/collocation/site',
          ),
          variant: 'secondary',
        },
      }}
      audiences={{
        title: (
          <>
            Built for the teams responsible for network{' '}
            <span className={beaconTheme.accentTextClassName}>reliability</span>
          </>
        ),
        description:
          'Beacon is especially useful where operations, maintenance, and data quality are tightly linked and small failures can quietly become bigger network problems.',
        items: [
          'Network administrators',
          'Field maintenance teams',
          'Engineering teams',
          'Data quality leads',
          'Research operations teams',
          'Collocation managers',
        ],
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
          'Open Beacon to review device health, inspect collocation workflows, and maintain stronger operational control across your monitoring network.',
        actions: [
          {
            label: 'Get Started on Beacon',
            href: getEnvironmentAwareUrl('https://beacon.airqo.net'),
          },
          {
            label: 'Health Reports',
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
              'Inspect maintenance and availability context across the network.',
            href: getEnvironmentAwareUrl(
              'https://beacon.airqo.net/dashboard/maintenance',
            ),
          },
          {
            title: 'Cohort Analysis',
            description:
              'Analyze device groups to identify recurring trends and issues.',
            href: getEnvironmentAwareUrl(
              'https://beacon.airqo.net/dashboard/analytics?analysis=cohorts',
            ),
          },
          {
            title: 'Automatic Reports',
            description:
              'Use recurring reports to maintain operational awareness over time.',
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
