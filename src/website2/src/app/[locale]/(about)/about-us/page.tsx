import type { Metadata } from 'next';

import AboutPage from '@/views/about/AboutPage';

export const metadata: Metadata = {
  title: 'About AirQo | Leading Air Quality Monitoring in Africa',
  description:
    "Learn about AirQo's journey, mission, and impact in revolutionizing air quality monitoring across Africa. Discover our team, partnerships with Google.org, World Bank, and others, and how we're empowering communities to combat air pollution where 9 out of 10 people breathe polluted air.",
  keywords:
    'AirQo, about AirQo, air quality Africa, AirQo team, AirQo mission, air pollution monitoring, African environmental initiative, clean air Africa, AirQo partners, AirQo impact, air quality research Africa',
  alternates: {
    canonical: 'https://airqo.net/about-us',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/about-us',
    title: 'About AirQo | Leading Air Quality Monitoring in Africa',
    description:
      "Discover AirQo's journey from a research project to Africa's leading air quality monitoring network, and how we're empowering communities to combat air pollution.",
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728295735/website/photos/about/teamImage_ganc1y.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Team Working on Air Quality Monitoring in Africa',
      },
    ],
  },
};

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
