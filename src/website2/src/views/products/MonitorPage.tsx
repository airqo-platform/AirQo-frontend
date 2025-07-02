'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { BiDownload } from 'react-icons/bi';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';

// Define motion variants for different animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const MonitorPage = () => {
  return (
    <div className="pb-16 flex flex-col w-full space-y-20">
      {/* Hero Section */}
      <motion.section
        className="bg-blue-50 py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} grid grid-cols-1 md:grid-cols-2 gap-12 items-center`}
        >
          {/* Text Content */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <p className="text-gray-500 mb-2 text-[14px]">
              Our Products {'>'} Binos Monitor
            </p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              Built in Africa for African cities.
            </h1>
            <p className="text-[18px] text-gray-700">
              Designed, manufactured, and calibrated to measure ambient air
              quality and optimized to suit the African context.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg"
              alt="Air quality monitor installation"
              width={500}
              height={350}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Locally Built Section */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`flex flex-col-reverse ${mainConfig.containerClass} lg:flex-row items-center lg:items-start relative`}
        >
          {/* Card Section */}
          <motion.div
            className="bg-green-50 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:left-0 lg:top-8 z-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">Designed for Africa</h3>
            <p className="text-lg text-gray-700 mb-4">
              The monitors are optimized with capabilities to cope with
              challenges like extreme weather conditions, including high levels
              of dust and heat, typical to the context of African cities.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Powered by either mains or solar, the device is optimized to work
              in settings characterized by unreliable power and intermittent
              internet connectivity. It runs on a 2G GSM network configuration
              for IoT SIM cards.
            </p>

            <CustomButton
              onClick={() =>
                window.open(
                  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038904/website/docs/Binos-Maintenance-Manual_agusuh.pdf',
                )
              }
              className="flex items-center justify-center bg-transparent text-gray-700 border border-black px-4 py-3 bg-none w-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Maintenance Manual
              <BiDownload className="ml-2 text-xl" />
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:ml-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132444/website/photos/OurProducts/Monitor/section-1_ia0mjq.webp"
              alt="Local Monitor"
              width={741}
              height={540}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Mobile Monitoring Section */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`flex flex-col-reverse ${mainConfig.containerClass} lg:flex-row items-center lg:items-start relative`}
        >
          {/* Image Section */}
          <motion.div
            className="order-2 lg:order-1 mt-12 lg:mt-0 lg:mr-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869451/website/photos/OurProducts/Monitor/image21_bppqoe.jpg"
              alt="Air quality monitor on a motorcycle"
              width={741}
              height={540}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>

          {/* Card Section */}
          <motion.div
            className="bg-green-50 p-6 rounded-lg shadow-md relative top-0 lg:max-w-md lg:absolute lg:right-0 lg:top-16 z-10 w-full sm:w-auto md:w-[630px] md:-top-10 flex flex-col space-y-6"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl">Mobile Monitoring</h3>
            <p className="text-lg text-gray-700">
              The monitors are easy to install and can be placed on static
              buildings or motorcycle taxis locally called
              &apos;boda-bodas&apos; to improve spatial coverage and revolution.
            </p>
            <p className="text-lg text-gray-700">
              Air quality data collection using motorcycle taxis has real
              potential for high-resolution air quality monitoring in urban
              spaces. Mobile monitoring enables us to close the gaps and spatial
              limitations of fixed static monitoring.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Monitors in African Cities */}
      <motion.section
        className="py-16 px-4 bg-[#EDF3FF]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`flex flex-col ${mainConfig.containerClass} lg:flex-row items-center lg:items-start relative`}
        >
          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:mr-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132444/website/photos/OurProducts/Monitor/Africa_bujaie.webp"
              alt="Air Quality Monitors"
              width={600}
              height={400}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>

          {/* Card Section */}
          <motion.div
            className="bg-green-50 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:right-0 lg:top-24 z-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">
              250+ Air quality monitors installed in 8 major African cities
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
          </motion.div>
        </div>
      </motion.section>

      {/* Monitor Installation Guide Section */}
      <motion.section
        className={`px-4 ${mainConfig.containerClass} grid grid-cols-1 lg:grid-cols-2 gap-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-[40px] font-semibold mb-4"
          variants={itemVariants}
        >
          <span className="text-blue-700">Monitor</span> Installation
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          This guide includes instructions and manuals on how to easily
          activate, install, operate and manage the Binos Air Quality Monitors.
        </motion.p>
      </motion.section>

      {/* Monitor Installation Section */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`flex flex-col-reverse ${mainConfig.containerClass} lg:flex-row items-center lg:items-start relative`}
        >
          {/* Card Section */}
          <motion.div
            className="bg-yellow-50 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:left-0 lg:top-16 z-10 space-y-6"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl">
              Activate, install, operate, and manage the Binos Monitors
            </h3>
            <div className="text-lg text-gray-700 mb-4">
              <p>In this guide, you will find recommendations:</p>
              <ol className="list-disc list-inside pl-5 mt-2">
                <li>Where to place the monitor</li>
                <li>How to install the monitor</li>
                <li>How to access the data using our analytics dashboard</li>
              </ol>
            </div>

            <CustomButton
              onClick={() =>
                window.open(
                  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1749629721/website/docs/Device_installation_guide_AirQo_adaptations__NEW_ntc89p.pdf',
                )
              }
              className="flex items-center justify-center text-gray-700 bg-transparent border mt-6 border-black px-4 py-3 bg-none w-full font-semibold"
            >
              Installation Guide
              <BiDownload className="ml-2 text-xl" />
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:ml-[300px] md:h-[480px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1743546958/website/photos/OurProducts/Monitor/Two_members_in_field_knwffk.jpg"
              alt="Two members in the field installing the monitor"
              width={500}
              height={400}
              style={{
                objectFit: 'cover',
              }}
              className="rounded-lg h-full w-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default MonitorPage;
