'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

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

const CalibratePage = () => {
  return (
    <div className="pb-16 flex flex-col w-full space-y-20">
      {/* Hero Section */}
      <motion.section
        className="bg-[#EDF3FF] py-16 px-4"
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
              Our Products {'>'} AirQalibrate
            </p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              Calibrate your low-cost sensor data
            </h1>
            <p className="text-[18px] text-gray-700">
              Improve the accuracy and reliability of data from your low-cost
              air quality monitors using AirQo&apos;s AirQalibrate tool,
              delivering more accurate results.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/calibration-header_u4y4co.webp"
              alt="Calibrate your low-cost sensor data"
              width={500}
              height={350}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
              loading="eager"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Why Calibrate Section */}
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
          <span className="text-blue-700">Why calibrate</span> your low-cost
          sensor data?
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          Low-cost sensors are relied on to increase the geographical coverage
          of air quality monitoring networks but, they are sensitive to ambient
          conditions (humidity, temperature) which could affect the accuracy of
          air quality data. Calibration enhances the quality and reliability of
          air quality data from low-cost sensors.
        </motion.p>
      </motion.section>

      {/* Cost Effective and Accessible Section */}
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
            className="bg-yellow-50 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:left-0 lg:top-8 z-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">
              Cost effective and accessible
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              AirQalibrate is a Machine Learning based calibration tool that
              eliminates the need for reference-grade monitors or on-site
              monitor calibration.
            </p>
            <p className="text-lg text-gray-700">
              It enables users without access to reference grade monitors or
              technical expertise to calibrate data from their low-cost
              monitors, improve performance, and build trust in the air quality
              network.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              This reduces operational costs involved in monitoring, thereby
              enabling the expansion of monitoring systems to create a dense air
              quality monitoring and management network.
            </p>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:ml-[300px] w-full lg:h-[550px]"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/section-1_hnmddw.webp"
              alt="Cost Effective Calibration"
              width={741}
              height={640}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full h-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Calibrate Your Data Section */}
      <motion.section
        className="px-4 py-16"
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
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/section-2_t8dlbm.webp"
              alt="Calibrate Your Data"
              width={600}
              height={400}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>

          {/* Card Section */}
          <motion.div
            className="bg-blue-100 relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute lg:right-0 lg:top-24 z-10"
            variants={cardVariants}
          >
            <h3 className="font-bold text-2xl mb-4">Calibrate your data</h3>
            <p className="text-lg text-gray-700 mb-4">
              Upload a CSV file containing your low-cost sensor PM<sub>2.5</sub>{' '}
              and PM<sub>10</sub> data, follow a few simple steps, and calibrate
              your data. The results are automatically downloaded when the
              calibration process is completed.
            </p>

            <CustomButton
              onClick={() => window.open('https://airqalibrate.airqo.net/')}
              className="flex items-center justify-center bg-transparent text-gray-700 border mt-6 border-black px-4 py-3 bg-none w-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Calibrate your data
              <span className="ml-2 text-xl">&#8599;</span>
            </CustomButton>
          </motion.div>
        </div>
      </motion.section>

      {/* Simple User Interface Section */}
      <motion.section
        className="bg-blue-100 py-16 px-4 overflow-hidden"
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
              <span className="text-blue-700">Simple </span>user interface
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our calibration tool features a user-friendly interface that
              simplifies the calibration process. Even without technical
              expertise, you can easily navigate the tool and calibrate the data
              from air quality monitors.
            </p>

            {/* Button */}

            <CustomButton
              onClick={() =>
                window.open(
                  'https://wiki.airqo.net/#/calibration/ml_based_approach',
                )
              }
              className=" text-white"
            >
              Calibration guide
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative mt-12 top-20 flex justify-center"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/section-3_nmblis.webp"
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

export default CalibratePage;
