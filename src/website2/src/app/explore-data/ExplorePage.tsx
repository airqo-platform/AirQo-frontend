'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { CustomButton } from '@/components/ui';

const ExplorePage = () => {
  const router = useRouter();

  // Framer Motion variant for text reveal
  const textReveal = {
    hidden: { opacity: 0, y: -20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="bg-gray-300 min-h-screen flex justify-center items-center px-4">
      <div className="max-w-5xl w-full bg-white shadow-md relative overflow-hidden lg:h-[600px]">
        {/* Close Button */}
        <Link
          href="/"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] h-full">
          {/* Left Section - Smooth sequential reveal for each part */}
          <div className="flex flex-col justify-center h-full bg-gray-50 p-8 lg:p-16">
            {/* Breadcrumb with reveal effect */}
            <motion.nav
              className="text-sm text-gray-500 mb-4"
              aria-label="Breadcrumb"
              initial="hidden"
              animate="visible"
              custom={1}
              variants={textReveal}
            >
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>{'>'}</li>
                <li>
                  <Link href="#" className="hover:underline">
                    Explore Data
                  </Link>
                </li>
              </ol>
            </motion.nav>

            {/* Heading with reveal effect */}
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-4"
              initial="hidden"
              animate="visible"
              custom={2}
              variants={textReveal}
            >
              Visualise air quality information.
            </motion.h1>

            {/* Description with reveal effect */}
            <motion.p
              className="text-gray-600 mb-8"
              initial="hidden"
              animate="visible"
              custom={3}
              variants={textReveal}
            >
              Access real-time and historic air quality information across
              Africa through our easy-to-use air quality analytics dashboard or
              mobile app.
            </motion.p>
          </div>

          {/* Right Section - Larger Width */}
          <div className="flex flex-col justify-center p-8 lg:p-16 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="bg-gray-100 rounded-t-lg w-full h-full flex justify-center items-center mb-4">
                  <div className="relative w-32 h-32">
                    <Image
                      src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728918806/website/photos/explore/discover-air-quality_opodxi.svg"
                      alt="AirQo App"
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </div>
                </div>
                <p className="text-gray-700 mb-2 text-sm text-center">
                  Discover the quality of air you are breathing.
                </p>
                <CustomButton
                  className="text-white"
                  onClick={() => router.push('/explore-data/mobile-app')}
                >
                  Download App
                </CustomButton>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="bg-gray-100 rounded-t-lg w-full flex justify-center items-center mb-4">
                  <div className="relative w-32 h-32">
                    <Image
                      src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728918807/website/photos/explore/air-quality-platform_s8c3su.svg"
                      alt="Air Quality Analytics"
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </div>
                </div>
                <p className="text-gray-700 mb-2 text-sm text-center">
                  An interactive air quality analytics platform
                </p>
                <CustomButton
                  onClick={() => window.open('https://analytics.airqo.net/')}
                  className="text-white"
                >
                  Air Quality Analytics
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
