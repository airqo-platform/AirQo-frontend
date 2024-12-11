'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import { CustomButton } from '@/components/ui';

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

const ApiPage = () => {
  return (
    <div className="pb-16 flex flex-col w-full space-y-20 overflow-hidden">
      {/* Hero Section */}
      <motion.section
        className="bg-yellow-50 py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <p className="text-gray-500 mb-2 text-[14px]">
              Our Products {'>'} AirQo API
            </p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              Access real-time air quality data.
            </h1>
            <p className="text-[18px] text-gray-700">
              Designed to effortlessly enhance your application with vital
              insights, embrace the transformative potential of air quality
              information through our API.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Api/HeaderImage_ktsstb.webp"
              alt="Access real-time air quality data"
              width={500}
              height={350}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Unlock Air Quality Insights Section */}
      <motion.section
        className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-[40px] font-semibold mb-4"
          variants={itemVariants}
        >
          Unlock Air Quality
          <br /> <span className="text-blue-700">Insights</span>
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          The AirQo API provides open access to a vast repository of over 2
          million records of raw and calibrated real-time, historical, and
          forecast air quality data.
        </motion.p>
      </motion.section>

      {/* Redefining Data Access Section */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="flex flex-col-reverse max-w-5xl mx-auto lg:flex-row items-center lg:items-start relative">
          {/* Card Section */}
          <motion.div
            className="bg-gray-100 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:left-0 lg:top-8 z-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">Redefining data access</h3>
            <p className="text-lg text-gray-700 mb-4">
              The API uses AI and data analysis techniques to provide accurate
              air quality measurements. It offers PM<sub>2.5</sub> and PM
              <sub>10</sub> measurements, the most common pollutants in African
              cities.
            </p>
            <p className="text-lg text-gray-700">
              Our comprehensive air quality datasets include data from our
              low-cost air quality monitors as well as reference-grade monitors
              strategically deployed in major African Cities.
            </p>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:ml-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Api/section-1_or1hzy.webp"
              alt="Redefining Data Access"
              width={741}
              height={540}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Empowering Audience Section */}
      <motion.section
        className="px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="flex flex-col max-w-5xl mx-auto lg:flex-row items-center lg:items-start relative">
          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:mr-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Api/section-2_vhnqbf.webp"
              alt="API Console Data"
              width={600}
              height={400}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>

          {/* Card Section */}
          <motion.div
            className="bg-yellow-50 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:right-0 lg:top-24 z-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">
              Start empowering your audience
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              The AirQo API is not only about air quality data—it&apos;s about
              empowering users to take action to protect themselves against air
              pollution.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              Integrate air quality information in your Open Source Projects,
              Browser Extensions, Plugins, Mobile Apps, Desktop and Web Apps.
              Help users take charge of their health and join the movement for
              cleaner air!
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="bg-blue-100 py-16 px-4 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Description and Button */}
          <motion.div
            className="text-center flex flex-col items-center space-y-6"
            variants={itemVariants}
          >
            <h2 className="text-[32px] font-bold">
              <span className="text-blue-700">How</span> it works
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              With our API, you have access to comprehensive documentation to
              enable you seamlessly integrate the data, and a dedicated support
              team to assist you at every step of the integration process.
            </p>

            {/* Button */}

            <CustomButton
              onClick={() =>
                window.open(
                  'https://docs.airqo.net/airqo-rest-api-documentation/',
                )
              }
              className=" text-white "
            >
              Read Docs
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative mt-12 top-20 flex justify-center"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Api/section-3_uwtkrz.webp"
              alt="Easy to use interface"
              width={1200}
              height={600}
              className="rounded-lg w-full"
              style={{ objectFit: 'cover' }}
            />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ApiPage;
