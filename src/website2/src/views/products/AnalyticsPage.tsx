'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('analyticsPage');

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
            <p className="text-gray-500 mb-2 text-[14px]">{t('breadcrumb')}</p>
            <h1 className="text-[48px] leading-[56px] font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-[18px] text-gray-700">{t('hero.description')}</p>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-header_csuujt.webp"
              alt={t('hero.imageAlt')}
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
          <span className="text-blue-700">{t('realTime.titleHighlight')}</span>{' '}
          {t('realTime.title')}
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          {t('realTime.description')}
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
            <h3 className="font-bold text-2xl mb-4">
              {t('timelyAccess.title')}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              {t('timelyAccess.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 mb-6">
              {t('timelyAccess.paragraph2')}
            </p>

            <CustomButton
              onClick={() =>
                window.open(
                  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038899/website/docs/AirQoAnalyticsPlatformUserGuide_ssyebk.pdf?#view=FitH',
                )
              }
              className="flex items-center justify-center bg-transparent text-gray-700 border-2 border-black px-4 py-3 bg-none w-full font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('timelyAccess.userGuide')}
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
              alt={t('timelyAccess.imageAlt')}
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
                alt={t('timelyAccess.overlapImageAlt')}
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
              alt={t('gainInsights.imageAlt')}
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
              {t('gainInsights.title')}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              {t('gainInsights.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 mt-4">
              {t('gainInsights.paragraph2')}
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
              <span className="text-blue-700">
                {t('easyToUse.titleHighlight')}
              </span>{' '}
              {t('easyToUse.title')}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {t('easyToUse.description')}
            </p>

            {/* Button */}
            <CustomButton
              onClick={() =>
                window.open('https://analytics.airqo.net/', '_blank')
              }
              className=" text-white"
            >
              {t('easyToUse.exploreButton')}
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative mt-12 top-20 flex justify-center"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-dashboard_qijm7k.webp"
              alt={t('easyToUse.imageAlt')}
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
