import { Metadata } from 'next';

import AboutPage from '@/views/cleanairforum/about/AboutPage';

const currentYear = new Date().getFullYear();
export const metadata: Metadata = {
  title: `About CLEAN-Air Forum ${currentYear} | Partnerships for Clean Air Solutions`,
  description: `Join the CLEAN-Air Forum ${currentYear} in Nairobi, Kenya - Africa's premier air quality convening. Learn about partnerships for clean air solutions, knowledge sharing, and multi-regional collaboration to tackle air pollution in African cities.`,
  keywords: `CLEAN-Air Forum ${currentYear}, Nairobi air quality conference, African air quality forum, clean air partnerships, air pollution solutions Africa, environmental conference Kenya, air quality knowledge sharing, African cities clean air`,
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/about',
  },
  openGraph: {
    type: 'website',
    title: `About CLEAN-Air Forum ${currentYear} | Partnerships for Clean Air Solutions`,
    description: `Join Africa's premier air quality convening in Nairobi. Partnerships for clean air solutions and multi-regional collaboration in ${currentYear}.`,
    url: 'https://airqo.net/clean-air-forum/about',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
        width: 1200,
        height: 630,
        alt: `CLEAN-Air Forum ${currentYear} Nairobi`,
      },
    ],
    siteName: 'AirQo',
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
