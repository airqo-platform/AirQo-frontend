import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

export type ProductFamily = 'measure' | 'understand' | 'act';

export type ProductFamilyLabel = 'Measure' | 'Understand' | 'Act';

export interface Product {
  id: string;
  name: string;
  category: string;
  family: ProductFamily;
  tagline: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  cta: string;
  featured?: boolean;
}

export interface ProductFamilyInfo {
  id: ProductFamily;
  label: ProductFamilyLabel;
  number: '01' | '02' | '03';
  title: string;
  description: string;
  shortDescription: string;
}

export const PRODUCT_FAMILIES: ProductFamilyInfo[] = [
  {
    id: 'measure',
    label: 'Measure',
    number: '01',
    title: 'Measure the air',
    description:
      'Low-cost monitors, calibration, and network health tools that make reliable air quality measurement possible across African cities.',
    shortDescription: 'Monitors, calibration, and network health.',
  },
  {
    id: 'understand',
    label: 'Understand',
    number: '02',
    title: 'Understand what the data means',
    description:
      'Dashboards, forecasting, and open data access that turn measurements into insight for cities, researchers, and developers.',
    shortDescription: 'Dashboards, forecasts, and open data.',
  },
  {
    id: 'act',
    label: 'Act',
    number: '03',
    title: 'Act on cleaner air',
    description:
      'Public tools and open data sharing that help people, organisations, and governments respond to air pollution.',
    shortDescription: 'Public tools and open data sharing.',
  },
];

export const PRODUCT_FAMILY_ORDER: ProductFamily[] = [
  'measure',
  'understand',
  'act',
];

export const PRODUCTS: Product[] = [
  {
    id: 'monitor',
    name: 'Binos Monitor',
    category: 'Air quality monitoring',
    family: 'measure',
    tagline: 'Locally built low-cost air quality monitors for African cities.',
    description:
      'Designed, manufactured, and calibrated in Africa, Binos monitors measure PM2.5 and PM10 in harsh urban conditions and run on solar or mains power.',
    href: '/products/monitor',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      { width: 1000 },
    ),
    imageAlt: 'AirQo Binos air quality monitor installed in the field',
    cta: 'Explore Binos Monitor',
    featured: true,
  },
  {
    id: 'calibrate',
    name: 'AirQalibrate',
    category: 'Sensor calibration',
    family: 'measure',
    tagline: 'AI-powered calibration for low-cost sensor data.',
    description:
      'AirQalibrate calibrates low-cost sensor data against reference monitors and machine-learning models so teams can trust the measurements.',
    href: '/products/calibrate',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/calibration-header_u4y4co.webp',
      { width: 1000 },
    ),
    imageAlt: 'AirQalibrate calibration workflow on a laptop',
    cta: 'Explore AirQalibrate',
  },
  {
    id: 'beacon',
    name: 'AirQo Beacon',
    category: 'Network operations',
    family: 'measure',
    tagline: 'Monitor device health and network performance.',
    description:
      'Beacon gives network teams a live view of device status, uptime, and collocation performance so data gaps are caught early.',
    href: '/products/beacon',
    image: '/assets/images/products/beacon/beacon-home.webp',
    imageAlt: 'AirQo Beacon device render mounted under a solar panel',
    cta: 'Explore AirQo Beacon',
  },
  {
    id: 'nexus',
    name: 'AirQo Nexus',
    category: 'Data platform',
    family: 'understand',
    tagline: 'Real-time and historical air quality data for African cities.',
    description:
      'Nexus is the public dashboard for exploring, comparing, and downloading air quality trends across monitored cities.',
    href: '/products/nexus',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-header_csuujt.webp',
      { width: 1000 },
    ),
    imageAlt: 'AirQo Nexus air quality dashboard',
    cta: 'Explore AirQo Nexus',
    featured: true,
  },
  {
    id: 'ai-platform',
    name: 'AirQo AI Platform',
    category: 'Environmental intelligence',
    family: 'understand',
    tagline: 'Forecasting, site selection, categorisation, and reporting.',
    description:
      'The AI Platform turns monitoring data into forecasts, recommended monitoring sites, and decision-ready reports.',
    href: '/products/ai-platform',
    image: '/assets/images/products/ai-platform/hero.webp',
    imageAlt:
      'AirQo AI Platform Locate workspace with recommended monitoring sites',
    cta: 'Explore AirQo AI Platform',
  },
  {
    id: 'api',
    name: 'Air Quality API',
    category: 'Developer data access',
    family: 'understand',
    tagline: 'Raw and calibrated air quality data for developers.',
    description:
      'The Air Quality API provides real-time, historical, and forecast PM2.5 and PM10 data with open access and clear documentation.',
    href: '/products/api',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1755105828/website/photos/OurProducts/Api/AirQo_API_hero_eoosnz.webp',
      { width: 1000 },
    ),
    imageAlt: 'Air Quality API documentation and data access',
    cta: 'Explore Air Quality API',
  },
  {
    id: 'mobile-app',
    name: 'AirQo Mobile App',
    category: 'Public information',
    family: 'act',
    tagline: 'Air quality information and forecasts in your pocket.',
    description:
      'The AirQo app gives people real-time and 24-hour forecast air quality information, health tips, and personalised alerts.',
    href: '/products/mobile-app',
    image: optimizeCloudinaryUrl(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741695567/website/photos/OurProducts/MobileApp/image7_fjjnl0.jpg',
      { width: 1000 },
    ),
    imageAlt: 'AirQo mobile app showing air quality information',
    cta: 'Explore the mobile app',
    featured: true,
  },
  {
    id: 'vertex',
    name: 'AirQo Vertex',
    category: 'Open data sharing',
    family: 'act',
    tagline: 'Connect monitors and share air quality data publicly.',
    description:
      'Vertex helps monitor owners connect devices, manage visibility, and contribute data to an open air quality network.',
    href: '/products/vertex',
    image: '/assets/images/products/vertex/bring-device.webp',
    imageAlt: 'AirQo Vertex device health and visibility dashboard',
    cta: 'Explore AirQo Vertex',
  },
];

export const getProductsByFamily = (family: ProductFamily): Product[] =>
  PRODUCTS.filter((product) => product.family === family);

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((product) => product.id === id);

export default PRODUCTS;
