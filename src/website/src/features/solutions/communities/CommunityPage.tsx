'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import CardWrapper from '@/components/sections/solutions/CardWrapper';
import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton } from '@/components/ui';
import mainConfig from '@/config/site.config';
import { useDispatch } from '@/hooks';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';
import { openModal } from '@/store/slices/modalSlice';

const IMAGE_800 = 800;
const IMAGE_1200 = 1200;

const images = {
  airQommunities: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/AirQommunities_gnx5of.webp',
    { width: IMAGE_1200 },
  ),
  championRect405: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248680/website/photos/Solutions/Rectangle_405_cl9ixu.webp',
    { width: IMAGE_800 },
  ),
  championRect411: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/Rectangle_411_ueuurb.webp',
    { width: IMAGE_800 },
  ),
  championStory: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1743547336/website/photos/Solutions/AIRQO_STORY_29_icjkc0.jpg',
    { width: IMAGE_800 },
  ),
  accessImg01: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/AirQo_Web_IMG01_kyvty5.webp',
    { width: IMAGE_800 },
  ),
  accessImg10: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248678/website/photos/Solutions/AirQo_Web_IMG10_rpw83s.webp',
    { width: IMAGE_800 },
  ),
  accessRect408: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/Rectangle_408_tkcdpv.webp',
    { width: IMAGE_800 },
  ),
  quotes: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248678/website/photos/Solutions/AirQo_quotes_odzokg.webp',
    { width: 120 },
  ),
  championStar: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/Communities_Star_qcl1e6.svg',
  ),
  arrowLeft: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/AirQo_arrow_left_qnp4qz.svg',
  ),
};

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
        breadcrumbText="Solutions / For Communities"
        title="For Communities"
        description="We work with residents, educators, young people, civil society organisations and local leaders to make air quality information accessible, strengthen public awareness and support community-led action for cleaner air."
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
            src={images.airQommunities}
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
                src={images.championStar}
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
              AirQommunity Champions are a growing network of local changemakers
              who use air quality information to raise awareness, start
              conversations and inspire action in their communities.
            </p>
            <p className="text-lg text-gray-700">
              We equip champions with practical knowledge and digital solutions
              to understand air pollution, communicate its health impacts and
              engage their communities around locally relevant solutions.
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
                src={images.championRect405}
                alt="Champion 2"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-full"
              />
              {/* Visible from sm and above */}
              <div className="hidden sm:block">
                <Image
                  src={images.championRect411}
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
                src={images.championStory}
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
                1500+
              </span>
              <Image
                src={images.arrowLeft}
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
              Amina is one of more than 1,500 AirQommunity Champions using
              AirQo&apos;s digital solutions to help people in her community
              understand air pollution and take action.
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

      {/* Making air quality information accessible */}
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
              Making air quality information accessible
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              People can only act on air pollution when they can understand the
              air they breathe.
            </p>
            <p className="text-lg text-gray-700">
              Through our open digital solutions, training and community
              engagement activities, we provide open access to timely, local air
              quality information and help communities turn data into insights
              they can use to protect their health, raise awareness and advocate
              for cleaner air.
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
                src={images.accessImg01}
                alt="Image 1"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-full"
              />
              {/* Visible from sm and above */}
              <div className="hidden sm:block">
                <Image
                  src={images.accessImg10}
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
                src={images.accessRect408}
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
              src={images.quotes}
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
          <div className="w-full text-center">
            <h2 className="text-3xl mb-4">Become an air quality champion.</h2>
            <span className="inline-block text-lg">Get involved →</span>
          </div>
        </CustomButton>
      </motion.div>
    </div>
  );
};

export default CommunitiesPage;
