import type { Metadata } from 'next';

import PressPage from '@/views/press/PressPage';

export const metadata: Metadata = {
  title: 'Press & Media Coverage | AirQo Air Quality Initiatives in Africa',
  description:
    "Explore the latest news, press releases, and media coverage about AirQo's innovative air quality monitoring initiatives across Africa. Discover how our work is being recognized globally, including our Google.org Leaders to Watch recognition and partnerships with major organizations.",
  keywords:
    'AirQo press, AirQo news, air quality news, AirQo media coverage, air pollution in Africa, AirQo press releases, air quality media, environmental news Africa, clean air initiatives press, AirQo publications, air monitoring news, Google.org Leaders to Watch, World Bank partnership, UN collaboration',
  alternates: {
    canonical: 'https://airqo.net/press',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/press',
    title: 'Press & Media Coverage | AirQo Air Quality Initiatives',
    description:
      "Explore the latest news, press releases, and media coverage about AirQo's innovative air quality monitoring initiatives across Africa.",
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/highlights/engineer_byss3s.webp',
        width: 1200,
        height: 630,
        alt: 'AirQo in the News - African Air Quality Leadership',
      },
    ],
    siteName: 'AirQo',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    title: 'Press & Media Coverage | AirQo Air Quality Initiatives',
    description:
      "Latest news and media coverage about AirQo's innovative air quality monitoring across Africa.",
    images: [
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/highlights/engineer_byss3s.webp',
    ],
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
