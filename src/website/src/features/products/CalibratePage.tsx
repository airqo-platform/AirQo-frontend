'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

const images = {
  header: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/calibration-header_u4y4co.webp',
    { width: 1000 },
  ),
  costEffective: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/section-1_hnmddw.webp',
    { width: 1200 },
  ),
  calibrate: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/section-2_t8dlbm.webp',
    { width: 1200 },
  ),
  interface: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132442/website/photos/OurProducts/Calibration/section-3_nmblis.webp',
    { width: 1200 },
  ),
};

const CALIBRATION_TOOL_URL = 'https://airqalibrate.airqo.net/';
const CALIBRATION_GUIDE_URL = 'https://docs.airqo.net/airqo-docs/airqalibrate';

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

const CalibratePage = () => {
  return (
    <div className="pb-16 flex flex-col w-full">
      {/* Hero */}
      <motion.section
        className="border-b border-line bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} px-4 py-12 sm:px-6 sm:py-16 lg:px-8`}
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="min-w-0 lg:col-span-7"
              variants={itemVariants}
            >
              <Link
                href="/products"
                className="text-sm text-gray-500 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Our Products / AirQalibrate
              </Link>
              <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Calibrate your low-cost sensor data
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
                Improve the accuracy and reliability of data from your low-cost
                air quality monitors using AirQo&apos;s AirQalibrate tool,
                delivering more accurate results.
              </p>
            </motion.div>

            <motion.div
              className="min-w-0 lg:col-span-5"
              variants={itemVariants}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
                <Image
                  src={images.header}
                  alt="Calibrate your low-cost sensor data"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Intro */}
      <motion.section
        className="border-t border-line"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} grid grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8`}
        >
          <motion.h2
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl"
            variants={itemVariants}
          >
            <span className="text-brand-700">Why calibrate</span> your low-cost
            sensor data?
          </motion.h2>
          <motion.p
            className="text-lg leading-7 text-gray-600"
            variants={itemVariants}
          >
            Low-cost sensors are relied on to increase the geographical coverage
            of air quality monitoring networks but, they are sensitive to
            ambient conditions (humidity, temperature) which could affect the
            accuracy of air quality data. Calibration enhances the quality and
            reliability of air quality data from low-cost sensors.
          </motion.p>
        </div>
      </motion.section>

      {/* Spotlight: cost effective */}
      <motion.section
        className="py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} grid items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8`}
        >
          <motion.div className="min-w-0 lg:col-span-7" variants={itemVariants}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
              <Image
                src={images.costEffective}
                alt="Cost effective calibration"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div className="min-w-0 lg:col-span-5" variants={itemVariants}>
            <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Cost effective and accessible
            </h3>
            <div className="mt-4 space-y-4 text-base leading-7 text-gray-600">
              <p>
                AirQalibrate is an AI-powered calibration tool that enhances the
                accuracy and reliability of air quality data from low-cost
                sensors. By using machine learning models, it corrects for
                environmental variability and sensor drift, delivering reliable,
                high-quality data without the need for reference-grade monitors
                or on-site calibration.
              </p>
              <p>
                AirQalibrate empowers users without access to reference-grade
                monitors or technical expertise to calibrate their sensor data,
                improve performance, and build trust in their air quality
                networks.
              </p>
              <p>
                By reducing the operational costs of monitoring, it supports the
                expansion of a dense, city-wide air quality monitoring and
                management network.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Spotlight: calibrate your data */}
      <motion.section
        className="py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} grid items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8`}
        >
          <motion.div
            className="min-w-0 lg:col-span-7 lg:order-2"
            variants={itemVariants}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
              <Image
                src={images.calibrate}
                alt="Calibrate your data"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            className="min-w-0 lg:col-span-5 lg:order-1"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Calibrate your data
            </h3>
            <div className="mt-4 space-y-4 text-base leading-7 text-gray-600">
              <p>
                Upload a CSV file containing your low-cost sensor PM
                <sub>2.5</sub> and PM<sub>10</sub> data, follow a few simple
                steps, and calibrate your data. The results are automatically
                downloaded when the calibration process is completed.
              </p>
            </div>
            <a
              href={CALIBRATION_TOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 whitespace-normal rounded-md px-5 py-3 text-sm font-semibold bg-brand text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Calibrate your data
              <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Simple user interface */}
      <motion.section
        className="bg-surface-muted py-12 sm:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="min-w-0 lg:col-span-5"
              variants={itemVariants}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Interface
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Simple user interface
              </h2>
              <p className="mt-4 text-lg leading-7 text-gray-600">
                Our calibration tool features a user-friendly interface that
                simplifies the calibration process. Even without technical
                expertise, you can easily navigate the tool and calibrate the
                data from air quality monitors.
              </p>
              <a
                href={CALIBRATION_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 whitespace-normal rounded-md px-5 py-3 text-sm font-semibold bg-brand text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Calibration guide
                <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              className="min-w-0 lg:col-span-7"
              variants={itemVariants}
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line bg-white">
                <Image
                  src={images.interface}
                  alt="Easy to use interface"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="bg-white py-12 sm:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
          <div className="rounded-md border border-brand-100 bg-brand-50 p-8 lg:p-12">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
                Work with AirQo
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Bring better air quality data to your city.
              </h2>
              <p className="mt-4 text-lg leading-7 text-gray-700">
                Explore the full AirQo system, or talk to the team about
                calibration for your monitoring network.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 whitespace-normal rounded-md px-5 py-3 text-sm font-semibold bg-brand text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Explore the full AirQo system
                <FiArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 whitespace-normal rounded-md border border-ink bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Talk to AirQo
                <FiArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default CalibratePage;
