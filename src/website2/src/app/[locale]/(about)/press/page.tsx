import type { Metadata } from 'next';

import PressPage from '@/views/press/PressPage';

export const metadata: Metadata = {
  title: 'Press & Media Coverage | AirQo Air Quality Initiatives in Africa',
  description:
    "Explore the latest news, press releases, and media coverage about AirQo's innovative air quality monitoring initiatives across Africa. Discover how our work is being recognized in addressing air pollution challenges.",
  keywords:
    'AirQo press, AirQo news, air quality news, AirQo media coverage, air pollution in Africa, AirQo press releases, air quality media, environmental news Africa, clean air initiatives press, AirQo publications, air monitoring news',
  alternates: {
    canonical: 'https://airqo.net/press',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/press',
    title: 'Press & Media Coverage | AirQo Air Quality Initiatives',
    description:
      "Explore the latest news, press releases, and media coverage about AirQo's innovative air quality monitoring initiatives across Africa.",
    siteName: 'AirQo',
  },
  category: 'Press',
  authors: [{ name: 'AirQo Communications Team' }],
  other: {
    'revisit-after': '7 days',
  },
};

const Page = () => {
  return (
    <div>
      <PressPage />
    </div>
  );
};

export default Page;
