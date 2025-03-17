'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import CardWrapper from '@/components/sections/solutions/CardWrapper';
import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton, Divider } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
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
  const t = useTranslations('africanCityPage');

  return (
    <div className="pb-16 flex flex-col w-full space-y-20">
      {/* Hero Section */}
      <HeroSection
        bgColor="bg-blue-50"
        breadcrumbText={t('breadcrumb')}
        title={t('hero.title')}
        description={t('hero.description')}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* Challenge Statement */}
      <motion.section
        className={`${mainConfig.containerClass} px-4 text-center py-16`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.p
          className="text-2xl lg:text-[40px] leading-[50px] text-gray-800"
          variants={itemVariants}
        >
          {t('challengeStatement')}
        </motion.p>
      </motion.section>

      <Divider />

      {/* Approach Section */}
      <motion.section
        className={`${mainConfig.containerClass} px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <section className="py-16 flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
          <motion.h2 className="text-3xl font-semibold" variants={itemVariants}>
            {t('approach.title')}
          </motion.h2>
          <motion.p
            className="lg:w-2/3 lg:max-w-[528px] text-lg text-gray-700"
            variants={itemVariants}
          >
            {t('approach.description')}
          </motion.p>
        </section>

        <motion.div
          className="bg-gray-100 p-8 rounded-lg shadow-md space-y-12"
          variants={containerVariants}
        >
          {/* Approach Item 1 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">
              {t('approach.items.monitoring.title')}
            </h3>
            <p className="text-lg text-gray-700">
              {t('approach.items.monitoring.description')}
            </p>
          </motion.div>
          <hr className="border-gray-300" />

          {/* Approach Item 2 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">
              {t('approach.items.platforms.title')}
            </h3>
            <p className="text-lg text-gray-700">
              {t('approach.items.platforms.description')}
            </p>
          </motion.div>
          <hr className="border-gray-300" />

          {/* Approach Item 3 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">
              {t('approach.items.policy.title')}
            </h3>
            <p className="text-lg text-gray-700">
              {t('approach.items.policy.description')}
            </p>
          </motion.div>
          <hr className="border-gray-300" />

          {/* Approach Item 4 */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="font-normal text-[32px]">
              {t('approach.items.community.title')}
            </h3>
            <p className="text-lg text-gray-700">
              {t('approach.items.community.description')}
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      <AfricanCities />

      <Divider />

      {/* Publications Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <CardWrapper className="bg-blue-50 space-y-4">
          <motion.h3
            className="text-blue-700 text-2xl font-semibold mb-2"
            variants={itemVariants}
          >
            {t('publications.label')}
          </motion.h3>
          <motion.h2
            className="text-2xl lg:text-4xl font-normal mb-4"
            variants={itemVariants}
          >
            {t('publications.title')}
          </motion.h2>
          <motion.div variants={itemVariants}>
            <p className="text-gray-800 font-semibold mb-1">
              {t('publications.publishedBy')}
            </p>
            <p className="text-gray-800 mb-6">{t('publications.publisher')}</p>
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
              {t('publications.readMore')}
            </CustomButton>
          </motion.div>
        </CardWrapper>
      </motion.section>
    </div>
  );
};

export default AfricanCityPage;
