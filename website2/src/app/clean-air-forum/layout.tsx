'use client';

// import { Metadata } from 'next';
import React, { ReactNode, useEffect, useState } from 'react';

import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import NewsLetter from '@/components/layouts/NewsLetter';
import BannerSection from '@/components/sections/Forum/BannerSection';
import { ForumDataProvider } from '@/context/ForumDataContext';
import { getForumEvents } from '@/services/apiService';

import Loading from '../loading';

// export const metadata: Metadata = {
//   title: 'Clean Air Forum | AirQo Africa',
//   description:
//     'Join the Clean Air Forum by AirQo to explore air quality initiatives, innovations, and discussions aimed at improving air quality in Africa.',
//   keywords:
//     'Clean Air Forum, AirQo Africa, air quality forum, air pollution, clean air Africa, environmental innovation, air quality initiatives',
//   openGraph: {
//     title: 'Clean Air Forum - AirQo Africa',
//     description:
//       'Discover AirQo’s Clean Air Forum, a platform to discuss innovations, strategies, and actions to improve air quality across Africa.',
//     url: 'https://yourdomain.com/clean-air-forum',
//     siteName: 'AirQo',
//     images: [
//       {
//         url: 'https://yourdomain.com/static/clean-air-forum-og-image.jpg',
//         width: 1200,
//         height: 630,
//         alt: 'AirQo Clean Air Forum - Improving Air Quality in Africa',
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     site: '@AirQo',
//     title: 'Clean Air Forum - AirQo Africa',
//     description:
//       'Explore the Clean Air Forum by AirQo to participate in discussions about improving air quality in Africa.',
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
//   alternates: {
//     canonical: 'https://yourdomain.com/clean-air-forum',
//   },
// };

type CleanAirLayoutProps = {
  children: ReactNode;
};

const CleanAirLayout: React.FC<CleanAirLayoutProps> = ({ children }) => {
  const [data, setData] = useState<any>(null); // Replace `any` with your actual data type
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForumEvents = async () => {
      try {
        const res = await getForumEvents();
        setData(res ? res[0] : null);
      } catch (error) {
        console.error('Failed to fetch forum events:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForumEvents();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <ForumDataProvider data={data}>
      <div className="min-h-screen w-full flex flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>

        {/* Pass the fetched data to BannerSection */}
        <BannerSection data={data} />

        {/* Main Content */}
        <main className="flex-1 pb-8">{children}</main>

        {/* Action Buttons Section */}
        <section className="my-16">
          <NewsLetter />
        </section>

        {/* Footer */}
        <footer>
          <Footer />
        </footer>
      </div>
    </ForumDataProvider>
  );
};

export default CleanAirLayout;
