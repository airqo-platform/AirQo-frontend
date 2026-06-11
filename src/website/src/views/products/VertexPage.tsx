'use client';

import {
  FiCloudLightning,
  FiGlobe,
  FiGrid,
  FiLayers,
  FiShare2,
  FiUploadCloud,
} from 'react-icons/fi';

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
        eyebrow: 'Open Device Deployment and Public Data Sharing',
        title: 'Bring your devices onto an open air quality network.',
        description:
          'Vertex helps organizations and device owners add monitors, manage visibility, and share public air quality data through AirQo without vendor lock-in.',
        image: {
          src: '/assets/images/products/vertex/bring-device.webp',
          alt: 'Vertex device health and visibility dashboard product showcase',
        },
      }}
      intro={{
        title: (
          <>
            A simpler path from{' '}
            <span className={vertexTheme.accentTextClassName}>
              device ownership
            </span>{' '}
            to public impact
          </>
        ),
        description:
          'Air quality devices are deployed by cities, universities, NGOs, and individual teams, but their data is often fragmented or hidden from broader use. Vertex closes that gap with one platform for onboarding, organization visibility, and network participation.',
      }}
      primarySection={{
        eyebrow: 'Open onboarding',
        title: 'Register, organize, and expose devices through one workflow',
        description: [
          'Vertex gives teams a structured way to add AirQo devices or import external devices into the network while maintaining a clear view of organization assets, sites, and sharing status.',
          'That makes it easier to move from private device ownership to broader public contribution without losing operational control.',
        ],
        image: {
          src: '/assets/images/products/vertex/application-1.webp',
          alt: 'Vertex network render showing connected devices across a mapped region',
        },
        cardBackgroundClassName: 'bg-[#EDF5FF]',
        action: {
          label: 'Open Vertex',
          href: 'https://vertex.airqo.net',
          variant: 'secondary',
        },
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
          'Vertex sits between deployment and public visibility. It is built for teams that want to connect devices, manage organizational context, and share more air quality data through an open ecosystem.',
        items: [
          {
            title: 'Guided device onboarding',
            description:
              'Register sensors individually or onboard them through structured import workflows.',
            Icon: FiUploadCloud,
          },
          {
            title: 'Deployment organization',
            description:
              'Track organization assets, sites, and device state from one working environment.',
            Icon: FiGrid,
          },
          {
            title: 'Public data sharing',
            description:
              'Publish readings through AirQo for governments, researchers, and communities.',
            Icon: FiShare2,
          },
          {
            title: 'Open network visibility',
            description:
              'Understand what is public, what is hidden, and what remains active across the organization.',
            Icon: FiGlobe,
          },
          {
            title: 'Multi-manufacturer support',
            description:
              'Connect devices from different hardware ecosystems instead of rebuilding around one stack.',
            Icon: FiLayers,
          },
          {
            title: 'Future infrastructure control',
            description:
              'Prepare for Vertex IoT Kit if your team needs a more self-hosted operational path.',
            Icon: FiCloudLightning,
          },
        ],
      }}
      useCases={{
        title: (
          <>
            Where{' '}
            <span className={vertexTheme.accentTextClassName}>Vertex</span>{' '}
            creates value
          </>
        ),
        description:
          'Vertex is designed for teams that need a practical bridge between ownership of devices and wider contribution to public environmental data.',
        items: [
          {
            title: 'Launch new deployments faster',
            description:
              'Bring AirQo and external devices into one structured workflow without rebuilding your operational setup from scratch.',
          },
          {
            title: 'Control what becomes public',
            description:
              'Manage organizations, sites, cohorts, and visibility settings so public sharing happens intentionally and with the right governance.',
          },
          {
            title: 'Expand without vendor lock-in',
            description:
              'Support a more open monitoring strategy by connecting different device ecosystems through one participation layer.',
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
            href: 'https://vertex.airqo.net',
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
            href: 'https://vertex.airqo.net',
          },
          {
            title: 'Share Publicly',
            description:
              'Publish organization devices and cohorts through AirQo visibility controls.',
            href: 'https://vertex.airqo.net',
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
