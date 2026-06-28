'use client';

import {
  FiCloudLightning,
  FiGlobe,
  FiGrid,
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
        breadcrumb: 'Our Products > Vertex',
        title: 'Connect your air quality monitors and share data publicly.',
        description:
          'Collecting air quality data is only the first step. For that data to inform decisions, support public awareness, and drive clean air action, it must be visible, accessible, and usable. Vertex helps monitor owners, organisations, and network managers connect air quality monitors, manage device visibility, track network health, and share data through an open air quality data platform.',
        image: {
          src: '/assets/images/products/vertex/bring-device.webp',
          alt: 'Vertex device health and visibility dashboard product showcase',
        },
        actions: [
          {
            label: 'Get Started on Vertex',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net'),
          },
          {
            label: 'Read the Documentation',
            href: 'https://docs.airqo.net/',
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
            <p className="mt-4">Vertex helps close that gap.</p>
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
            What makes{' '}
            <span className={vertexTheme.accentTextClassName}>Vertex</span>{' '}
            useful
          </>
        ),
        description:
          'Vertex connects device deployment with public visibility through a single platform.',
        items: [
          {
            title: 'Guided device onboarding',
            description:
              'Register sensors individually or through bulk import workflows.',
            Icon: FiUploadCloud,
          },
          {
            title: 'Deployment organization',
            description:
              'Track assets, sites, and device state from one dashboard.',
            Icon: FiGrid,
          },
          {
            title: 'Public data sharing',
            description: 'Publish readings through AirQo for public access.',
            Icon: FiShare2,
          },
          {
            title: 'Open network visibility',
            description:
              'Control what is public, hidden, or active across your organization.',
            Icon: FiGlobe,
          },
          {
            title: 'Multi-manufacturer support',
            description: 'Connect devices from different hardware ecosystems.',
            Icon: FiLayers,
          },
          {
            title: 'Future infrastructure control',
            description:
              'Prepare for Vertex IoT Kit for self-hosted operations.',
            Icon: FiCloudLightning,
          },
        ],
      }}
      downloadSection={{
        title: (
          <>
            Download{' '}
            <span className={vertexTheme.accentTextClassName}>Vertex</span>{' '}
            Desktop
          </>
        ),
        description:
          'Get the Vertex desktop application for Windows to manage your devices and air quality data locally.',
        actions: [
          {
            label: 'Download for Windows',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net/download'),
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Visibility and sharing',
        title:
          'Manage device visibility in a way that makes public contribution practical',
        description: [
          'Vertex is designed to make sharing less abstract. It helps organizations understand which devices are visible, which cohorts are public, and how their network appears inside the broader AirQo ecosystem.',
          'This is what makes the platform useful beyond onboarding alone: it links deployment, public visibility, and future data reuse in one place.',
        ],
        image: {
          src: '/assets/images/products/vertex/vertex-dashboard-showcase.webp',
          alt: 'Vertex application interface with device health and visibility sections',
        },
        cardBackgroundClassName: 'bg-[#EEF8F1]',
        reverse: true,
        action: {
          label: 'Read Vertex Docs',
          href: 'https://platform.airqo.net/docs/vertex/intro/',
          variant: 'secondary',
        },
      }}
      audiences={{
        title: (
          <>
            Built for organizations that want a more{' '}
            <span className={vertexTheme.accentTextClassName}>open</span> and
            visible network
          </>
        ),
        description:
          'Vertex is useful wherever the challenge is not only collecting readings, but making those readings accessible, reusable, and easier to contribute to public environmental understanding.',
        items: [
          'City governments',
          'Research institutions',
          'Universities',
          'NGOs and environmental agencies',
          'Independent monitor owners',
          'Open-source contributors',
        ],
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
          'Use Vertex to onboard devices, manage visibility, and bring more air quality data into public circulation through AirQo.',
        actions: [
          {
            label: 'Get Started on Vertex',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net'),
          },
          {
            label: 'Vertex IoT Kit',
            href: 'https://forms.gle/9FKfbpGFxtYCmrui9',
            variant: 'secondary',
          },
        ],
        quickLinks: [
          {
            title: 'Import Your Devices',
            description:
              'Start onboarding monitors through the main Vertex workflow.',
            href: getEnvironmentAwareUrl('https://vertex.airqo.net'),
          },
          {
            title: 'Vertex Docs',
            description:
              'Review setup and integration guidance for the deployment platform.',
            href: 'https://platform.airqo.net/docs/vertex/intro/',
          },
          {
            title: 'IoT Kit Waitlist',
            description:
              'Join the early access path for the self-hostable Vertex core.',
            href: 'https://forms.gle/9FKfbpGFxtYCmrui9',
          },
        ],
      }}
    />
  );
};

export default VertexPage;
