'use client';

import {
  FiBarChart2,
  FiCompass,
  FiCpu,
  FiFileText,
  FiGrid,
  FiTrendingUp,
} from 'react-icons/fi';

import ProductMarketingPage from './ProductMarketingPage';

const aiTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-[#EDF3FF]',
  capabilitiesBackgroundClassName: 'bg-slate-50',
  audiencesBackgroundClassName: 'bg-[#EEF6FF] border border-blue-100',
  ctaBackgroundClassName: 'bg-gradient-to-br from-white via-blue-50 to-cyan-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const AIPlatformPage = () => {
  return (
    <ProductMarketingPage
      theme={aiTheme}
      hero={{
        breadcrumb: 'Our Products > AirQo AI Platform',
        eyebrow: 'Forecasting, Site Selection, Categorization, and Reporting',
        title: 'Turn air quality data into environmental intelligence.',
        description:
          'AirQo AI Platform combines forecasting, site recommendation, categorization, reporting, and spatial analysis in one workspace so teams can move from raw observations to clearer environmental decisions.',
        image: {
          src: '/assets/images/products/ai-platform/ai-platform-locate-showcase.png',
          alt: 'AirQo AI Locate workspace showing an analysis boundary, recommended monitoring sites, and planning insights',
        },
      }}
      intro={{
        title: (
          <>
            One platform for{' '}
            <span className={aiTheme.accentTextClassName}>forecasting</span>,
            planning, and reporting
          </>
        ),
        description:
          'The AirQo AI Platform helps organizations move from monitoring data to action-ready insight. It is built for planning, interpretation, and decision support across public health, research, and urban environmental management.',
      }}
      primarySection={{
        eyebrow: 'Environmental intelligence',
        title:
          'A real workspace for forecasting, siting, categorization, and report generation',
        description: [
          'The platform combines forecast cards, monitoring summaries, site recommendation, categorization, and reports in one interface so teams can work from a shared analytical view.',
          'That makes it useful for organizations that need more than data access alone and want clearer reasoning about what to do next.',
        ],
        image: {
          src: '/assets/images/products/ai-platform/ai-platform-workbench.png',
          alt: 'AI Platform workbench visual showing advanced environmental analysis',
        },
        cardBackgroundClassName: 'bg-[#EDF5FF]',
        action: {
          label: 'Open AirQo AI',
          href: 'https://ai.airqo.net',
          variant: 'secondary',
        },
      }}
      capabilities={{
        title: (
          <>
            What the{' '}
            <span className={aiTheme.accentTextClassName}>AI Platform</span>{' '}
            helps you do
          </>
        ),
        description:
          'The value of AirQo AI comes from bringing advanced analytical functions into a single product surface that teams can actually use in monitoring, planning, and communication workflows.',
        items: [
          {
            title: 'Air quality forecasting',
            description:
              'Generate daily and hourly PM2.5 forecasts using machine learning models.',
            Icon: FiTrendingUp,
          },
          {
            title: 'AI-powered site deployment',
            description:
              'Use LOCATE to recommend monitoring sites based on environmental and geospatial factors.',
            Icon: FiCompass,
          },
          {
            title: 'Site categorization',
            description:
              'Classify monitoring locations using surrounding land-use and environmental characteristics.',
            Icon: FiGrid,
          },
          {
            title: 'Automated reporting',
            description:
              'Produce summaries and reports without rebuilding the same analytical narrative manually.',
            Icon: FiFileText,
          },
          {
            title: 'Spatial analysis tools',
            description:
              'Investigate hotspots, clustering, and distribution patterns across monitored areas.',
            Icon: FiBarChart2,
          },
          {
            title: 'Decision support',
            description:
              'Support policymakers, practitioners, and researchers with more actionable environmental insight.',
            Icon: FiCpu,
          },
        ],
      }}
      useCases={{
        title: (
          <>
            How organizations apply the{' '}
            <span className={aiTheme.accentTextClassName}>AI Platform</span>
          </>
        ),
        description:
          'The platform is strongest when teams need not only visibility into air quality, but also structured analytical support for where to focus, deploy, and communicate.',
        items: [
          {
            title: 'Forecast and prepare',
            description:
              'Use forecast views to understand likely PM2.5 conditions and plan communication or intervention before exposure risks escalate.',
          },
          {
            title: 'Choose better monitoring sites',
            description:
              'Apply LOCATE and categorization workflows to decide where monitors should go and how those sites should be interpreted.',
          },
          {
            title: 'Explain decisions clearly',
            description:
              'Turn analysis into summaries, reports, and planning narratives that policymakers, implementers, and researchers can act on.',
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Planning and interpretation',
        title:
          'Use AI to choose where to act and communicate why those choices matter',
        description: [
          'By combining site recommendation, categorization, spatial analysis, and reporting, the platform creates a stronger bridge between environmental data science and applied monitoring strategy.',
          'This is what makes it useful beyond prediction alone: it helps teams turn information into planning logic and decision support.',
        ],
        image: {
          src: '/assets/images/products/ai-platform/ai-platform-locate-showcase.png',
          alt: 'AirQo AI Locate map with boundary planning, recommended sites, and priority monitoring locations',
        },
        cardBackgroundClassName: 'bg-[#FFF7E8]',
        reverse: true,
        action: {
          label: 'Explore Locate',
          href: 'https://ai.airqo.net/locate',
          variant: 'secondary',
        },
      }}
      audiences={{
        title: (
          <>
            Built for teams that need faster, better environmental{' '}
            <span className={aiTheme.accentTextClassName}>decisions</span>
          </>
        ),
        description:
          'The AI Platform is positioned for analytical and planning work across public, research, and environmental management contexts.',
        items: [
          'Government agencies',
          'City authorities and urban planners',
          'Environmental researchers',
          'Public health organizations',
          'Monitoring teams',
          'Environmental consultants',
        ],
      }}
      ctaSection={{
        eyebrow: 'AirQo AI Platform',
        title: (
          <>
            Use AI to forecast, place, classify, and explain air quality with
            more <span className={aiTheme.accentTextClassName}>confidence</span>
          </>
        ),
        description:
          'Open AirQo AI to explore the map, run Locate, categorize sites, and access reporting workflows built for environmental intelligence.',
        actions: [
          {
            label: 'Open the Platform',
            href: 'https://ai.airqo.net',
          },
          {
            label: 'View Reports',
            href: 'https://ai.airqo.net/reports',
            variant: 'secondary',
          },
        ],
        quickLinks: [
          {
            title: 'Map',
            description:
              'Explore the monitoring surface and air quality intelligence layer.',
            href: 'https://ai.airqo.net/map',
          },
          {
            title: 'Locate',
            description:
              'Run the AI-assisted site recommendation workflow for monitor deployment.',
            href: 'https://ai.airqo.net/locate',
          },
          {
            title: 'Categorize',
            description:
              'Interpret sites through environmental characteristics and surrounding context.',
            href: 'https://ai.airqo.net/categorize',
          },
          {
            title: 'Reports',
            description:
              'Access summaries and reporting outputs for decision support and communication.',
            href: 'https://ai.airqo.net/reports',
          },
        ],
      }}
    />
  );
};

export default AIPlatformPage;
