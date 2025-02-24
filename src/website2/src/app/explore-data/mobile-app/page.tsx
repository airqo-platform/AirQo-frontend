'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const AppPromo = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side: Image with responsiveness */}
      <div className="w-full lg:w-1/2 relative h-64 lg:h-auto">
        <Image
          src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/explore/man-download-app_qg1pt2.png"
          alt="User using AirQo app"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
          loading="eager"
        />
      </div>

      {/* Right Side: Promo Content with responsive padding */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center items-start text-left bg-white p-8 md:p-12 lg:p-24">
        {/* Back button */}
        <div className="relative mb-2 lg:absolute top-0 left-0 p-4">
          <Link href="/explore-data" passHref>
            <span className="text-2xl text-gray-500 hover:text-gray-700">
              &larr;
            </span>
          </Link>
        </div>

        {/* AirQo logo with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
            alt="AirQo Logo"
            width={80}
            height={80}
            loading="eager"
          />
        </motion.div>

        {/* App promo text with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get the AirQo app
          </h1>
          <p className="text-base md:text-lg text-gray-500 mb-8 md:mb-10">
            Discover the quality of air you are breathing.
          </p>
        </motion.div>

        {/* QR code and Download buttons with animation */}
        <motion.div
          className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* QR Code - Larger size for better visibility */}
          <div className="border border-gray-300 rounded-lg p-4">
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132437/website/photos/QR_code_ysf0ca.jpg"
              alt="QR Code for AirQo App"
              width={220}
              height={220}
              loading="eager"
            />
          </div>

          {/* Download buttons */}
          <div className="flex flex-col space-y-4">
            <a
              href="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179257/website/photos/apple_vpcn6j.png"
                alt="Download on the App Store"
                width={160}
                height={50}
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.airqo.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179280/website/photos/google_play_vdmjrx.png"
                alt="Get it on Google Play"
                width={160}
                height={50}
              />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AppPromo;
