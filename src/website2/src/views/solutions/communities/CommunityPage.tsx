'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import CardWrapper from '@/components/sections/solutions/CardWrapper';
import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useDispatch } from '@/hooks';
import { openModal } from '@/store/slices/modalSlice';

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

const CommunitiesPage = () => {
  const dispatch = useDispatch();

  return (
    <div className="pb-16 flex flex-col w-full space-y-20">
      {/* Hero Section */}
      <HeroSection
        bgColor="bg-yellow-50"
        breadcrumbText="Solutions > For Communities"
        title="For Communities"
        description="We harness the value that comes with bringing together community members passionate about clean air and a healthy environment."
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* AirQo + Communities -> AirQommunities */}
      <motion.section
        className={`${mainConfig.containerClass} py-16 px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/AirQommunities_gnx5of.webp"
            alt="AirQo + Communities"
            width={1166}
            height={277}
            style={{ objectFit: 'contain' }}
            className="w-full"
          />
        </motion.div>
      </motion.section>

      {/* AirQommunity Champions */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div
          className={`${mainConfig.containerClass} grid grid-cols-1 sm:grid-cols-2 gap-8 items-center`}
          variants={itemVariants}
        >
          {/* Text Content */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-4">
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/Communities_Star_qcl1e6.svg"
                alt="AirQommunity Champion Icon"
                width={90}
                height={90}
                className="bg-blue-100 p-2 rounded-full mr-4"
              />
              <h2 className="text-[32px] leading-[36px] font-medium">
                AirQommunity <br /> champions
              </h2>
            </div>
            <p className="text-lg text-gray-700 mb-4">
              AirQommunity champions and ambassadors are individuals who are
              part of a growing network of change makers dedicated to improving
              air quality at the grassroots level.
            </p>
            <p className="text-lg text-gray-700">
              They use air quality data to create positive change in the fight
              against air inequality while contributing insights and ideas on
              major issues and potential solutions to air quality challenges in
              their communities.
            </p>
          </motion.div>

          {/* Images Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            {/* Left Column: Two Small Images */}
            <div className="grid grid-rows-2 gap-4">
              {/* Always visible */}
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248680/website/photos/Solutions/Rectangle_405_cl9ixu.webp"
                alt="Champion 2"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-full"
              />
              {/* Visible from sm and above */}
              <div className="hidden sm:block">
                <Image
                  src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/Rectangle_411_ueuurb.webp"
                  alt="Champion 1"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Right Column: Large Image (Visible from sm and above) */}
            <div className="hidden sm:flex">
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/Rectangle_410_btjgs7.webp"
                alt="Champion 3"
                width={500}
                height={700}
                className="object-cover rounded-lg w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 300 AirQommunity champions */}
      <motion.section
        className="w-full overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div
          className={`${mainConfig.containerClass} py-12 md:py-16 flex flex-col lg:flex-row  gap-4 items-center`}
          variants={itemVariants}
        >
          {/* Left column with title */}
          <motion.div
            className="bg-[#FFFBF0] font-medium relative px-14 py-8 rounded-l-full w-full lg:max-w-[361px] flex flex-col justify-center items-start"
            variants={itemVariants}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[#FFE600] font-dm-mono text-4xl md:text-5xl font-normal">
                300
              </span>
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/AirQo_arrow_left_qnp4qz.svg"
                alt="AirQommunity Icon"
                width={60}
                height={52}
                className=""
              />
            </div>
            <h3 className="text-[#1F2937] text-3xl md:text-4xl font-serif">
              AirQommunity
              <br />
              champions
            </h3>
          </motion.div>

          {/* Right column with description */}
          <motion.div
            className="bg-[#FFFBF0] p-10 rounded-r-full w-full flex flex-col justify-center items-center"
            variants={itemVariants}
          >
            <p className="text-[#1F2937] font-light leading-[36px] text-lg md:text-[28px]">
              Amina, one of our air quality champions — helping raise awareness
              about air pollution in her community through our digital
              technologies.
              <Link
                target="_blank"
                href="https://blog.airqo.net/helping-communities-combat-air-pollution-through-digital-technologies-6a5924a1e1e"
                className="text-lg ml-3 md:text-xl text-[#1F2937] underline hover:text-gray-600 transition-colors mt-2 inline-block"
              >
                Read story
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Access to air quality information */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div
          className={`${mainConfig.containerClass} grid grid-cols-1 sm:grid-cols-2 gap-8 items-center`}
          variants={itemVariants}
        >
          {/* Text Content */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">
              Facilitating access to air quality information
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Access to air quality data is one of the biggest challenges in
              tackling air pollution in Africa. We close the air quality data
              gaps by training and giving free access to real-time data on air
              quality across Africa, from our open-air quality monitoring
              platform.
            </p>
            <p className="text-lg text-gray-700">
              Through building and ensuring access to digital platforms that
              help us know the pattern or behavior of air quality, we are
              facilitating evidence-based decision-making in air quality.
            </p>
          </motion.div>

          {/* Images Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            {/* Left Column: Two Small Images */}
            <div className="grid grid-rows-2 gap-4">
              {/* Always visible */}
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/AirQo_Web_IMG01_kyvty5.webp"
                alt="Image 1"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-full"
              />
              {/* Visible from sm and above */}
              <div className="hidden sm:block">
                <Image
                  src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248678/website/photos/Solutions/AirQo_Web_IMG10_rpw83s.webp"
                  alt="Image 2"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Right Column: Large Image (Visible from sm and above) */}
            <div className="hidden sm:flex">
              <Image
                src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/Rectangle_408_tkcdpv.webp"
                alt="Large Image"
                width={500}
                height={700}
                className="object-cover rounded-lg w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Quote Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <CardWrapper className="bg-yellow-50">
          <motion.div className="text-left space-y-4" variants={itemVariants}>
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248678/website/photos/Solutions/AirQo_quotes_odzokg.webp"
              alt="Quote Icon"
              width={60}
              height={60}
              className="mb-2"
            />
            <blockquote className="text-2xl lg:text-[40px] text-left leading-[48px] font-normal mb-4">
              We advocate for road safety and environmental protection from
              pollution associated with the transport industry, and depend a lot
              on the AirQo platform to get air quality data in order to extend
              air quality education to the communities.
            </blockquote>
            <p className="text-lg font-bold">Michael Wanyama</p>
            <p className="text-gray-700">Team Lead on AutoSafety</p>
          </motion.div>
        </CardWrapper>
      </motion.section>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex justify-center"
      >
        <CustomButton
          onClick={() => dispatch(openModal())}
          className={`${mainConfig.containerClass} w-full px-4 rounded-lg text-black py-16 bg-[#FFEA2B]`}
        >
          <div className="text-center">
            <h2 className="text-3xl mb-4">Become an air quality champion.</h2>
            <span className="inline-block text-lg">Get involved →</span>
          </div>
        </CustomButton>
      </motion.div>
    </div>
  );
};

export default CommunitiesPage;
