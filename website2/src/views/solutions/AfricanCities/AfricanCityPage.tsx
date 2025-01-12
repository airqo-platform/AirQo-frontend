'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { CustomButton, Divider } from '@/components/ui';
import AfricanCities from '@/views/solutions/AfricanCities/AfricanCities';

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

const AfricanCityPage = () => {
  return (
    <div className="pb-16 flex flex-col w-full space-y-20">
      {/* Hero Section */}
      <motion.section
        className="bg-blue-50 py-16 px-4 h-full max-h-[416px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Text Content */}
          <motion.div variants={itemVariants}>
            <p className="text-gray-500 mb-2 text-[14px]">
              Solutions {'>'} For African Cities
            </p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              For African cities
            </h1>
            <p className="text-[18px] text-gray-700">
              Leveraging a high-resolution air quality monitoring network to
              advance air quality <br /> management in African cities.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Challenge Statement */}
      <motion.section
        className="max-w-5xl mx-auto px-4 text-center py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.p
          className="text-2xl lg:text-[40px] leading-[50px] text-gray-800"
          variants={itemVariants}
        >
          Many African cities lack actionable data and evidence on the scale and
          magnitude of air pollution in order to tackle air pollution, a major
          urban environmental health challenge.
        </motion.p>
      </motion.section>

      <Divider />

      {/* Approach Section */}
      <motion.section
        className="max-w-5xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <section className="py-16 flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
          <motion.h2 className="text-3xl font-semibold" variants={itemVariants}>
            Our Approach
          </motion.h2>
          <motion.p
            className="lg:w-2/3 lg:max-w-[528px] text-lg text-gray-700"
            variants={itemVariants}
          >
            We empower city authorities and citizens with timely information and
            evidence to address the air pollution challenge.
          </motion.p>
        </section>

        <motion.div
          className="bg-gray-100 p-8 rounded-lg shadow-md space-y-12"
          variants={containerVariants}
        >
          {/* Approach Item 1 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">
              Locally developed high-resolution <br />
              air quality monitoring network
            </h3>
            <p className="text-lg text-gray-700">
              We want to see cleaner air in all African Cities. We leverage our
              understanding of the African context and close collaborations with
              relevant partners to deliver a high-resolution air quality network
              to inform contextualized and locally relevant approaches to air
              quality management for African cities.
            </p>
          </motion.div>
          <hr className="border-gray-300" />

          {/* Approach Item 2 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">
              Community-aware digital air quality platforms
            </h3>
            <p className="text-lg text-gray-700">
              We empower decision-makers and citizens in African Cities with
              increased access to air quality data evidence to help them tackle
              urban air quality and achieve cleaner air objectives.
            </p>
          </motion.div>
          <hr className="border-gray-300" />

          {/* Approach Item 3 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">Policy Engagement</h3>
            <p className="text-lg text-gray-700">
              We engage city authorities and government agencies to build their
              capacity and empower them with evidence and digital tools for air
              quality management and informing air quality public policies.
            </p>
          </motion.div>
          <hr className="border-gray-300" />

          {/* Approach Item 4 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">Community engagement</h3>
            <p className="text-lg text-gray-700">
              We empower local leaders and targeted communities with air quality
              information to create awareness of air quality issues.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      <AfricanCities />

      <Divider />

      {/* Publications Section */}
      <motion.section
        className="bg-blue-50 p-16 space-y-6 rounded-lg max-w-5xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.h3
          className="text-blue-700 text-2xl font-semibold mb-2"
          variants={itemVariants}
        >
          PUBLICATIONS
        </motion.h3>
        <motion.h2
          className="text-2xl lg:text-4xl font-normal mb-4"
          variants={itemVariants}
        >
          Seeing the air in detail: Hyperlocal air quality dataset collected
          from spatially distributed AirQo network.
        </motion.h2>
        <motion.div variants={itemVariants}>
          <p className="text-gray-800 font-semibold mb-1">Published by</p>
          <p className="text-gray-800 mb-6">AirQo</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <CustomButton
            onClick={() =>
              window.open(
                'https://www.sciencedirect.com/science/article/pii/S2352340922007065?via%3Dihub',
                '_blank',
              )
            }
            className="flex items-center bg-transparent px-4 w-full max-w-[200px] py-3 border text-gray-700 border-gray-700 hover:bg-gray-200"
          >
            Read More →
          </CustomButton>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default AfricanCityPage;
