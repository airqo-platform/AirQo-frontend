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

const AnalyticsPage = () => {
  return (
    <div className="pb-16 flex flex-col w-full space-y-20 overflow-hidden">
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
              Our Products {'>'} Air quality analytics Dashboard
            </p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              Access and visualise air quality data in African Cities.
            </h1>
            <p className="text-[18px] text-gray-700">
              If we can’t measure air pollution, we can’t manage it: Access,
              track, analyse and download insightful air quality data across
              major cities in Africa.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-header_csuujt.webp"
              alt="Access and visualise air quality data"
              width={500}
              height={350}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
              loading="eager"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Unlock Air Quality Insights Section */}
      <motion.section
        className={`${mainConfig.containerClass} px-4 grid grid-cols-1 lg:grid-cols-2 gap-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-[40px] font-semibold mb-4"
          variants={itemVariants}
        >
          <span className="text-blue-700">Real-time</span> air quality analytics
          for African Cities
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          Air pollution in many cities in Africa is under-monitored in part due
          to the logistical constraints of setting up and maintaining a
          monitoring network, coupled with the expertise to process and analyse
          data.
        </motion.p>
      </motion.section>

      {/* Timely Access Section */}
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
            <h3 className="font-bold text-2xl mb-4">Timely access to data</h3>
            <p className="text-lg text-gray-700 mb-4">
              The air quality analytics dashboard is an intuitive software
              dashboard that allows you to have timely access to historic,
              real-time, and forecast actionable air quality information across
              our monitored urban spaces in Africa.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We want to see citizens and decision-makers in African Cities have
              timely access to air quality trends, patterns, and insights to
              inform data-driven decisions to tackle air pollution.
            </p>

            <CustomButton
              onClick={() =>
                window.open(
                  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038899/website/docs/AirQoAnalyticsPlatformUserGuide_ssyebk.pdf?#view=FitH',
                )
              }
              className="flex items-center justify-center bg-transparent text-gray-700 border-2 border-black px-4 py-3 bg-none w-full font-semibold hover:bg-gray-100 transition-colors"
            >
              User Guide
              <BiDownload className="ml-2 text-xl" />
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative mt-12 lg:mt-0 lg:ml-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/section-1_awoy4i.webp"
              alt="Timely access to data"
              width={741}
              height={540}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
            <motion.div
              className="absolute top-2 -right-52 w-full h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/section-1-overlap_sosw3o.webp"
                alt="Timely access to data"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg w-full md:w-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Gain Insights Section */}
      <motion.section
        className="py-16 px-4"
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
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132443/website/photos/OurProducts/Analytics/section-2_xv8lnw.webp"
              alt="Gain insights to take action"
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
              Gain insights to take action
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              We integrate AI and machine learning models to deliver predictive
              insights, giving stakeholders access to historical, real-time, or
              forecast air quality data in locations that matter to them. This
              empowers the stakeholders to make evidence-informed decisions to
              better manage air pollution.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              Easily generate, download and compare air quality data across
              various African cities and develop evidence-informed actions for
              air pollution.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Easy to Use Interface Section */}
      <motion.section
        className="bg-blue-50 py-16 px-4 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className={`${mainConfig.containerClass} space-y-8`}>
          {/* Description and Button */}
          <motion.div
            className="text-center flex flex-col items-center space-y-6"
            variants={itemVariants}
          >
            <h2 className="text-[32px] font-bold">
              <span className="text-blue-700">Easy to use</span> interface
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our visualization charts are designed to help you easily interpret
              and gain insights into the data while giving you access to air
              quality trends in African Cities over time. With our easy-to-use
              interface, you can track and visualise air quality trends over
              time.
            </p>

            {/* Button */}

            <CustomButton
              onClick={() =>
                window.open('https://analytics.airqo.net/', '_blank')
              }
              className=" text-white"
            >
              Explore data
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative mt-12 top-20 flex justify-center"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-dashboard_qijm7k.webp"
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

export default AnalyticsPage;
