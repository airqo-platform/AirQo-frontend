'use client';

import {
  FiGlobe,
  FiGrid,
  FiHeart,
  FiLayers,
  FiShare2,
  FiUploadCloud,
} from 'react-icons/fi';

import { getEnvironmentAwareUrl } from '@/lib/environmentAwareUrl';

import ProductMarketingPage from './ProductMarketingPage';

const vertexTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-[#F4FBFF]',
  capabilitiesBackgroundClassName: 'bg-[#EFFBF5]',
  audiencesBackgroundClassName: 'bg-[#F5FAFF] border border-blue-100',
  ctaBackgroundClassName:
    'bg-gradient-to-br from-white via-emerald-50 to-blue-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const VertexPage = () => {
  return (
    <ProductMarketingPage
      theme={vertexTheme}
      hero={{
        breadcrumb: 'Our Products / AirQo Vertex',
        title: 'Connect your air quality monitors and share data publicly.',
        description:
          'Collecting air quality data is only the first step. For that data to inform decisions, support public awareness, and drive clean air action, it must be visible, accessible, and usable. AirQo Vertex helps monitor owners, organisations, and network managers connect air quality monitors, manage device visibility, track network health, and share data through an open air quality data platform.',
        image: {
          src: '/assets/images/products/vertex/bring-device.webp',
          alt: 'AirQo Vertex device health and visibility dashboard product showcase',
        },
        actions: [
          {
            label: 'Get Started on AirQo Vertex',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net'),
          },
          {
            label: 'Read the Documentation',
            href: 'https://platform.airqo.net/docs/vertex/intro/',
            variant: 'secondary',
          },
        ],
      }}
      intro={{
        title: (
          <>
            Bring your air quality data into{' '}
            <span className={vertexTheme.accentTextClassName}>
              one open network
            </span>
          </>
        ),
        description: (
          <>
            <p>
              Across African cities, more air quality monitors are being
              deployed to close critical data gaps. But monitoring alone is not
              enough. The data also needs to move into systems where it can be
              managed, shared, and used to inform action.
            </p>
            <p className="mt-4">AirQo Vertex helps close that gap.</p>
            <p className="mt-4">
              It gives monitor owners a clear way to connect their devices,
              manage their sensor network and share air quality data publicly.
              This makes data easier to access, compare and use for research,
              public awareness, policy and clean air action.
            </p>
          </>
        ),
      }}
      capabilities={{
        title: (
          <>
            What you can do with{' '}
            <span className={vertexTheme.accentTextClassName}>
              AirQo Vertex
            </span>
          </>
        ),
        description:
          'AirQo Vertex provides a simple way to move from device deployment to public data sharing.',
        items: [
          {
            title: 'Add your air quality monitors',
            description:
              'Register individual monitors or import multiple devices at once through a guided onboarding workflow.',
            Icon: FiUploadCloud,
          },
          {
            title: 'Connect monitors from different manufacturers',
            description:
              'Bring together air quality monitors from different hardware providers and sensor networks. AirQo Vertex is built to support more open data sharing without tying users to one device ecosystem.',
            Icon: FiLayers,
          },
          {
            title: 'Manage your sensor network',
            description:
              'Organise devices by organisation, site, deployment area or project, and keep a clear view of your monitoring network.',
            Icon: FiGrid,
          },
          {
            title: 'Track device health and maintenance',
            description:
              'See whether your devices are online, active and transmitting data, so your team can respond quickly when a monitor needs attention.',
            Icon: FiHeart,
          },
          {
            title: 'Choose what to share publicly',
            description:
              'Control which devices remain private and which ones contribute to public air quality data. Share selected data while keeping flexibility over how your network is managed.',
            Icon: FiShare2,
          },
          {
            title: 'Contribute to open air quality data',
            description:
              'Make your air quality data available to researchers, governments, communities, developers and the public, helping more people understand the air they breathe.',
            Icon: FiGlobe,
          },
        ],
      }}
      downloadSection={{
        title: (
          <>
            Download{' '}
            <span className={vertexTheme.accentTextClassName}>
              AirQo Vertex
            </span>{' '}
            Desktop
          </>
        ),
        description:
          'Get the AirQo Vertex desktop application for Windows to manage your devices and air quality data locally.',
        actions: [
          {
            label: 'Download for Windows',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net/download'),
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Visibility and sharing',
        title: 'From deployed monitors to public impact',
        description: [
          'Air quality data becomes more useful when it can be accessed, understood and used by more people.',
          'By opening up more sensor data, organisations can support better research, stronger public awareness, more informed policy and cleaner air decisions. AirQo Vertex makes this easier by giving monitor owners the tools to manage their devices and share selected data through one open platform.',
        ],
        image: {
          src: '/assets/images/products/vertex/vertex-dashboard-showcase.webp',
          alt: 'AirQo Vertex application interface with device health and visibility sections',
        },
        cardBackgroundClassName: 'bg-[#EEF8F1]',
        reverse: true,
        action: {
          label: 'Read AirQo Vertex Docs',
          href: 'https://platform.airqo.net/docs/vertex/intro/',
          variant: 'secondary',
        },
      }}
      ctaSection={{
        eyebrow: 'AirQo Vertex',
        title: (
          <>
            Open your devices to a broader data ecosystem without losing
            operational{' '}
            <span className={vertexTheme.accentTextClassName}>flexibility</span>
          </>
        ),
        description:
          'Use AirQo Vertex to onboard devices, manage visibility, and bring more air quality data into public circulation through AirQo.',
        actions: [
          {
            label: 'Get Started on AirQo Vertex',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net'),
          },
          {
            label: 'AirQo Vertex IoT Kit',
            href: 'https://forms.gle/9FKfbpGFxtYCmrui9',
            variant: 'secondary',
          },
        ],
        quickLinks: [
          {
            title: 'Import Your Devices',
            description:
              'Start onboarding monitors through the main AirQo Vertex workflow.',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net'),
          },
          {
            title: 'AirQo Vertex Docs',
            description:
              'Review setup and integration guidance for the deployment platform.',
            href: 'https://platform.airqo.net/docs/vertex/intro/',
          },
          {
            title: 'IoT Kit Waitlist',
            description:
              'Join the early access path for the self-hostable AirQo Vertex core.',
            href: 'https://forms.gle/9FKfbpGFxtYCmrui9',
          },
        ],
      }}
    />
  );
};

export default VertexPage;
