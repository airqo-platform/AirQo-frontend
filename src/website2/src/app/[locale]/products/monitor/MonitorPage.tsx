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

const MonitorPage = () => {
  const t = useTranslations('monitorPage');

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
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132447/website/photos/OurProducts/Monitor/monitor_ffky74.webp"
              alt={t('hero.imageAlt')}
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
            <h3 className="font-bold text-2xl mb-4">
              {t('designedForAfrica.title')}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              {t('designedForAfrica.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 mb-6">
              {t('designedForAfrica.paragraph2')}
            </p>

            <CustomButton
              onClick={() =>
                window.open(
                  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038904/website/docs/Binos-Maintenance-Manual_agusuh.pdf',
                )
              }
              className="flex items-center justify-center bg-transparent text-gray-700 border border-black px-4 py-3 bg-none w-full font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('designedForAfrica.maintenanceManual')}
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
              alt={t('designedForAfrica.imageAlt')}
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
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132444/website/photos/OurProducts/Monitor/section-2_byzxsz.webp"
              alt={t('mobileMonitoring.imageAlt')}
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
            <h3 className="font-bold text-2xl">
              {t('mobileMonitoring.title')}
            </h3>
            <p className="text-lg text-gray-700">
              {t('mobileMonitoring.paragraph1')}
            </p>
            <p className="text-lg text-gray-700">
              {t('mobileMonitoring.paragraph2')}
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
              alt={t('monitorsInAfrica.imageAlt')}
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
              {t('monitorsInAfrica.title')}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              {t('monitorsInAfrica.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 mt-4">
              {t('monitorsInAfrica.paragraph2')}
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
          <span className="text-blue-700">
            {t('installationGuide.titleHighlight')}
          </span>{' '}
          {t('installationGuide.title')}
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          {t('installationGuide.description')}
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
            <h3 className="font-bold text-2xl">{t('installation.title')}</h3>
            <div className="text-lg text-gray-700 mb-4">
              <p>{t('installation.intro')}</p>
              <ol className="list-disc list-inside pl-5 mt-2">
                <li>{t('installation.steps.step1')}</li>
                <li>{t('installation.steps.step2')}</li>
                <li>{t('installation.steps.step3')}</li>
              </ol>
            </div>

            <CustomButton
              onClick={() =>
                window.open(
                  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038903/website/docs/AirQoMonitorUserGuideV04_ogbfjs.pdf',
                )
              }
              className="flex items-center justify-center text-gray-700 bg-transparent border mt-6 border-black px-4 py-3 bg-none w-full font-semibold"
            >
              {t('installation.guideButton')}
              <BiDownload className="ml-2 text-xl" />
            </CustomButton>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="mt-12 lg:mt-0 lg:ml-[300px] w-full"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132444/website/photos/OurProducts/Monitor/activate_g6upn0.webp"
              alt={t('installation.imageAlt')}
              width={500}
              height={400}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
            />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default MonitorPage;
