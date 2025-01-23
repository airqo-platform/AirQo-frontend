'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import AppDownloadSection from '@/views/home/AppDownloadSection';

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

const MobilePage = () => {
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
              Our Products {'>'} Mobile App
            </p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              Discover the quality of air around you.
            </h1>
            <p className="text-[18px] text-gray-700">
              Access to reliable air quality data is the first step to
              protecting yourself against air pollution. The AirQo Mobile App is
              easy to use and free to download, allowing you to stay up-to-date
              on the quality of the air you are breathing.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/MobileApp/mobile-header_cz3n6t.webp"
              alt="Discover the quality of air around you"
              width={500}
              height={350}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
              loading="eager"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Know Your Air Section */}
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
          Know your <span className="text-blue-700">Air</span>
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          The AirQo Air quality Mobile App is the first of its kind in Africa.
          With the App, you have access to real-time and forecast air quality
          information from monitored urban areas across major cities in Africa.
        </motion.p>
      </motion.section>

      {/* Personalized Air Quality Alerts Section */}
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
            <h3 className="font-bold text-2xl mb-4">
              Personalized air quality alerts and notifications
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              Receive personalized air quality alerts and recommendations to
              empower you to take action and stay healthy.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Set up your favourite places to quickly check the quality of air
              in areas that matter to you.
            </p>
            <p className="text-lg text-gray-700">
              Turn on the notifications to know the quality of the air you are
              breathing.
            </p>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative mt-12 lg:mt-0 lg:ml-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/MobileApp/section-1_x2ppgk.webp"
              alt="Personalized air quality alerts"
              width={741}
              height={540}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />

            <div className="w-[200px] h-[200px] absolute -right-24 top-40">
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/MobileApp/section-1-bell_wsueyx.webp"
                alt="Personalized air quality alerts"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg w-full md:w-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Real-time and Forecast Section */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="flex flex-col-reverse max-w-5xl mx-auto lg:flex-row items-center lg:items-start relative">
          {/* Image Section */}
          <motion.div
            className="relative order-2 lg:order-1 mt-12 lg:mt-0 lg:mr-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/MobileApp/section-2_vgl9ey.webp"
              alt="Real-time and forecast"
              width={741}
              height={540}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
            <div className="absolute -left-24 top-40 w-[328px] h-[260px]">
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/MobileApp/section-2-calendar_onibdg.webp"
                alt="Real-time and forecast"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg w-full md:w-full"
              />
            </div>
          </motion.div>

          {/* Card Section */}
          <motion.div
            className="bg-gray-100 p-6 rounded-lg shadow-md relative top-0 lg:max-w-md lg:absolute lg:right-0 lg:top-16 z-10 w-full sm:w-auto md:w-[630px] md:-top-10 flex flex-col space-y-6"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl">Real-time and forecast</h3>
            <p className="text-lg text-gray-700">
              Our App gives you access to real-time and forecast air quality
              information at the palm of your hands, giving you the power to
              make informed decisions about your daily activities.
            </p>
            <p className="text-lg text-gray-700">
              Our 24-hour air quality forecast developed using Machine Learning
              and AI provides you with the power to better plan your day, know
              when to take a walk or a jog to avoid air pollution and stay
              healthy.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Health Tips Section */}
      <motion.section
        className="px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto flex flex-col-reverse lg:flex-row gap-8 items-center relative">
          {/* Card Section (Health Tips Description) */}
          <motion.div
            className="bg-gray-100 p-6 rounded-lg shadow-md w-full lg:w-[40%] z-10 lg:absolute lg:left-0 lg:top-44 sm:w-auto md:w-[630px] md:-top-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">Health tips</h3>
            <p className="text-lg text-gray-700 mb-4">
              Our App provides you with detailed information beyond the numbers.
            </p>
            <p className="text-lg text-gray-700">
              You have access to frequent tips to help you stay healthy and
              learn how you can reduce your exposure to air pollution.
            </p>
          </motion.div>

          {/* Composite Image Section */}
          <motion.div
            className="lg:w-2/3 rounded-lg flex justify-center lg:justify-end lg:items-end mt-16 lg:mt-0 lg:ml-[300px] w-full"
            variants={itemVariants}
          >
            <div className="relative right-12">
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/MobileApp/section-3_zyyjnx.webp"
                alt="Health Tips Composite Image"
                width={402}
                height={475}
                style={{ objectFit: 'cover' }}
                className="rounded-lg w-full lg:w-auto"
              />
            </div>
          </motion.div>

          {/* Background Section */}
          <motion.div
            className="absolute bottom-20 lg:-bottom-16 left-0 lg:left-64 w-[100%] lg:w-[75%] h-[75%] lg:h-[100%] lg:rounded-lg bg-[#EDF3FF] -z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          ></motion.div>
        </div>
      </motion.section>

      {/* App Download Section */}

      <AppDownloadSection
        title="Download the app"
        description="Discover the quality of air you are breathing"
        appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
        googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
        mockupImage="https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071559/website/photos/wrapper_aum5qm.png"
      />
    </div>
  );
};

export default MobilePage;
