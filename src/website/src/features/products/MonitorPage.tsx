'use client';

import Image from 'next/image';
import {
  FiCpu,
  FiGlobe,
  FiMapPin,
  FiSun,
  FiTruck,
  FiWifi,
} from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { useImpactNumbers } from '@/hooks/useApiHooks';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import ProductMarketingPage from './ProductMarketingPage';

const images = {
  hero: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
    { width: 1000 },
  ),
  locallyBuilt: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132444/website/photos/OurProducts/Monitor/section-1_ia0mjq.webp',
    { width: 1200 },
  ),
  mobileMonitoring: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869451/website/photos/OurProducts/Monitor/image21_bppqoe.jpg',
    { width: 1200 },
  ),
  coverage: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132444/website/photos/OurProducts/Monitor/Africa_bujaie.webp',
    { width: 1200 },
  ),
  field: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1743546958/website/photos/OurProducts/Monitor/Two_members_in_field_knwffk.jpg',
    { width: 1000 },
  ),
};

const MAINTENANCE_MANUAL_URL =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038904/website/docs/Binos-Maintenance-Manual_agusuh.pdf';
const INSTALLATION_GUIDE_URL =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1749629721/website/docs/Device_installation_guide_AirQo_adaptations__NEW_ntc89p.pdf';
const MONITORING_SOLUTIONS_DOC_URL =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1773140737/website/docs/AirQo_Air_Quality_Monitoring_Solution_rtiz2c.pdf';

const monitorTheme = {
  accentTextClassName: 'text-blue-700',
  heroBackgroundClassName: 'bg-blue-50',
  capabilitiesBackgroundClassName: 'bg-[#EDF3FF]',
  audiencesBackgroundClassName: 'bg-[#F5FAFF] border border-blue-100',
  ctaBackgroundClassName:
    'bg-gradient-to-br from-white via-blue-50 to-green-50',
  quickLinksCardClassName: 'bg-white',
} as const;

const MonitorPage = () => {
  const { data: impactNumbersResponse } = useImpactNumbers();
  const impactNumbers = impactNumbersResponse?.[0] ?? null;

  return (
    <ProductMarketingPage
      theme={monitorTheme}
      hero={{
        breadcrumb: 'Our Products / Binos Monitor',
        title: 'Built in Africa for African cities.',
        description:
          'Designed, manufactured, and calibrated to measure ambient air quality and optimized to suit the African context.',
        image: {
          src: images.hero,
          alt: 'Air quality monitor installation',
        },
        actions: [
          {
            label: 'Explore Monitoring Plans',
            href: MONITORING_SOLUTIONS_DOC_URL,
          },
          {
            label: 'Installation Guide',
            href: INSTALLATION_GUIDE_URL,
            variant: 'secondary',
          },
        ],
      }}
      intro={{
        title: (
          <>
            <span className={monitorTheme.accentTextClassName}>
              Designed for Africa
            </span>
          </>
        ),
        description: (
          <>
            <p>
              The monitors are optimized with capabilities to cope with
              challenges like extreme weather conditions, including high levels
              of dust and heat, typical of the context of African cities. We
              apply AI-driven calibration systems to enhance the accuracy and
              reliability of the air quality data.
            </p>
            <p className="mt-4">
              Powered by either mains or solar, the device is optimized to work
              in settings characterized by unreliable power and intermittent
              internet connectivity. It runs on a 2G GSM network configuration
              for IoT SIM cards.
            </p>
          </>
        ),
      }}
      primarySection={{
        eyebrow: 'Locally built',
        title: 'Designed for African cities',
        description: [
          'The monitors are optimized with capabilities to cope with challenges like extreme weather conditions, including high levels of dust and heat, typical of the context of African cities. We apply AI-driven calibration systems to enhance the accuracy and reliability of the air quality data.',
          'Powered by either mains or solar, the device is optimized to work in settings characterized by unreliable power and intermittent internet connectivity.',
        ],
        image: {
          src: images.locallyBuilt,
          alt: 'Local Monitor',
        },
        cardBackgroundClassName: 'bg-green-50',
      }}
      capabilities={{
        title: (
          <>
            Monitors in{' '}
            <span className={monitorTheme.accentTextClassName}>
              African Cities
            </span>
          </>
        ),
        description:
          "We're providing an end-to-end air quality solution in major African cities leveraging the locally built low-cost monitors and existing expertise to advance air quality management.",
        items: [
          {
            title: 'AI-driven calibration',
            description:
              'We apply AI-driven calibration systems to enhance the accuracy and reliability of the air quality data from the monitors.',
            Icon: FiCpu,
          },
          {
            title: 'Extreme weather resilience',
            description:
              'Optimized to cope with extreme weather conditions including high levels of dust and heat typical of African cities.',
            Icon: FiSun,
          },
          {
            title: 'Solar and mains powered',
            description:
              'Powered by either mains or solar, the device is optimized to work in settings characterized by unreliable power.',
            Icon: FiWifi,
          },
          {
            title: 'Flexible installation',
            description:
              'The monitors are easy to install and can be placed on static buildings or motorcycle taxis to improve spatial coverage.',
            Icon: FiTruck,
          },
          {
            title: 'End-to-end monitoring',
            description:
              'From hardware deployment to data access, we provide a complete monitoring solution including technical support.',
            Icon: FiGlobe,
          },
          {
            title: 'City-wide coverage',
            description:
              'Providing air quality data across major African cities to help tackle air pollution at scale.',
            Icon: FiMapPin,
          },
        ],
      }}
      secondarySection={{
        eyebrow: 'Mobile monitoring',
        title: 'Revolutionizing spatial coverage',
        description: [
          "The monitors are easy to install and can be placed on static buildings or motorcycle taxis locally called 'boda-bodas' to improve spatial coverage and revolution.",
          'Air quality data collection using motorcycle taxis has real potential for high-resolution air quality monitoring in urban spaces. Mobile monitoring enables us to close the gaps and spatial limitations of fixed static monitoring.',
        ],
        image: {
          src: images.mobileMonitoring,
          alt: 'Air quality monitor on a motorcycle',
        },
        cardBackgroundClassName: 'bg-green-50',
        reverse: true,
      }}
      downloadSection={{
        title: 'Monitor Installation',
        description:
          'This guide includes instructions and manuals on how to easily activate, install, operate and manage the Binos Air Quality Monitors.',
        actions: [
          {
            label: 'Maintenance Manual',
            href: MAINTENANCE_MANUAL_URL,
          },
          {
            label: 'Installation Guide',
            href: INSTALLATION_GUIDE_URL,
            variant: 'secondary',
          },
        ],
      }}
      childrenAfterDownload
      ctaSection={{
        eyebrow: 'AirQo Monitoring Solutions',
        title: 'Deploy air quality monitoring in your City',
        description:
          'AirQo provides scalable air quality monitoring solutions designed for cities, institutions, and communities seeking reliable air pollution data. From neighbourhood pilots to city-wide monitoring networks, our plans are built to support partners at every stage of deployment.',
        actions: [
          {
            label: 'Explore Monitoring Plans',
            href: MONITORING_SOLUTIONS_DOC_URL,
          },
        ],
        quickLinks: [
          {
            title: 'Maintenance Manual',
            description:
              'Download the Binos monitor maintenance manual for setup and care guidance.',
            href: MAINTENANCE_MANUAL_URL,
          },
        ],
      }}
    >
      {/* Impact stats section – rendered via children slot */}
      <section className="py-16 px-4 bg-[#EDF3FF]">
        <div
          className={`flex flex-col ${mainConfig.containerClass} lg:flex-row items-center lg:items-start relative`}
        >
          <div className="mt-12 lg:mt-0 lg:mr-[300px] w-full">
            <Image
              src={images.coverage}
              alt="Air Quality Monitors"
              width={600}
              height={400}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </div>

          <div className="bg-green-50 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:right-0 lg:top-24 z-10">
            <h3 className="font-bold text-2xl mb-4">
              {impactNumbers?.deployed_monitors ?? 350}+ Air quality monitors
              installed in {impactNumbers?.african_cities ?? 8} major African
              cities
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              To effectively tackle air pollution, access to data and contextual
              evidence is important to show the scale and magnitude of air
              pollution.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              We&apos;re providing an end-to-end air quality solution in major
              African cities leveraging the locally built low-cost monitors and
              existing expertise to advance air quality management, and
              implicitly, air quality improvement in these African cities.
            </p>
          </div>
        </div>
      </section>
    </ProductMarketingPage>
  );
};

export default MonitorPage;
