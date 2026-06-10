'use client';

import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiMapPin,
  FiShield,
  FiTool,
} from 'react-icons/fi';

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
        eyebrow: 'Device Health and Collocation Management',
        title: 'Monitor device performance before data gaps grow.',
        description:
          'Beacon gives operations and engineering teams a clearer view of device health, deployment status, uptime, and collocation quality across distributed air quality sensor networks.',
        image: {
          src: '/assets/images/products/beacon/beacon-device-render.png',
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
        description:
          'As monitoring networks expand across different cities, climates, and infrastructure conditions, failures become harder to detect early. Beacon is built to give teams the operational visibility they need to keep networks reliable, responsive, and trusted over time.',
      }}
      primarySection={{
        eyebrow: 'Operational monitoring',
        title:
          'One dashboard for device health, deployment status, and field response',
        description: [
          'Beacon centralizes device monitoring so teams can quickly understand what is deployed, what is online, what is being tracked, and where performance is slipping.',
          'This makes it easier to move from reactive support to more deliberate operational management across distributed devices and sites.',
        ],
        image: {
          src: '/assets/images/products/beacon/beacon-dashboard-showcase.png',
          alt: 'Beacon device monitoring dashboard product showcase',
        },
        cardBackgroundClassName: 'bg-[#EEF8F1]',
        action: {
          label: 'Open Device Monitoring',
          href: 'https://beacon.airqo.net/dashboard/maintenance',
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
      useCases={{
        title: (
          <>
            How teams use{' '}
            <span className={beaconTheme.accentTextClassName}>Beacon</span>
          </>
        ),
        description:
          'Beacon is most useful when teams need to move quickly from detection to response without losing the broader picture of network health.',
        items: [
          {
            title: 'Track reliability daily',
            description:
              'Use one operational surface to review uptime, online state, and deployment coverage before problems become prolonged outages.',
          },
          {
            title: 'Prioritize maintenance work',
            description:
              'Focus field attention on the devices, sites, and cohorts that show the greatest operational risk or repeated instability.',
          },
          {
            title: 'Protect data quality',
            description:
              'Review collocation behavior and recurring performance signals early enough to support stronger calibration and quality assurance decisions.',
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
          src: '/assets/images/products/beacon/beacon-device-render.png',
          alt: 'Beacon hardware render used on the product page',
        },
        cardBackgroundClassName: 'bg-[#FFF7E8]',
        reverse: true,
        action: {
          label: 'Open Site Collocation',
          href: 'https://beacon.airqo.net/dashboard/collocation/site',
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
            href: 'https://beacon.airqo.net',
          },
          {
            label: 'Health Reports',
            href: 'https://beacon.airqo.net/dashboard/reports',
            variant: 'secondary',
          },
        ],
        quickLinks: [
          {
            title: 'Device Map',
            description:
              'Inspect maintenance and availability context across the network.',
            href: 'https://beacon.airqo.net/dashboard/maintenance',
          },
          {
            title: 'Site Collocation',
            description:
              'Review site-level collocation behavior and compare sensor performance.',
            href: 'https://beacon.airqo.net/dashboard/collocation/site',
          },
          {
            title: 'Cohort Analysis',
            description:
              'Analyze device groups to identify recurring trends and issues.',
            href: 'https://beacon.airqo.net/dashboard/analytics?analysis=cohorts',
          },
          {
            title: 'Automatic Reports',
            description:
              'Use recurring reports to maintain operational awareness over time.',
            href: 'https://beacon.airqo.net/dashboard/reports',
          },
        ],
      }}
    />
  );
};

export default BeaconPage;
