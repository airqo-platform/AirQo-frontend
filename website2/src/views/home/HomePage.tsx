'use client';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useRef } from 'react';

import ReversibleContentSection from '@/components/sections/ReversibleContentSection';

import AnalyticsContentSection from './AnalyticsContentSection';
import AppDownloadSection from './AppDownloadSection';
import FeaturedCarousel from './FeaturedCarousel';
import HomePlayerSection from './HomePlayerSection';
import StatisticsSection from './HomeStatsSection';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const HomePage = () => {
  const t = useTranslations('home');
  // Helper to create a motion div that shows on scroll
  const MotionSection = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, {
      once: true,
      margin: '0px 0px -150px 0px',
    });

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={sectionVariants}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="space-y-20">
      {/* Home Player Section */}
      <HomePlayerSection />

      {/* Statistics Section */}
      <MotionSection>
        <StatisticsSection />
      </MotionSection>

      {/* Reversible Content Section 1 */}
      <MotionSection>
        <ReversibleContentSection
          title={t('highResolutionTitle')}
          subtitle={t('airQualityMonitor')}
          description={t('monitorDescription')}
          buttonText={t('learnMore')}
          buttonLink="/products/monitor"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175985/website/photos/monitorHome_dmmrsk.png"
          reverse={false}
          backgroundColor="bg-transparent"
        />
      </MotionSection>

      {/* Analytics Content Section */}
      <MotionSection>
        <AnalyticsContentSection
          title={t('analyticsTitle')}
          subtitle={t('airQualityAnalytics')}
          description={t('analyticsDescription')}
          buttonText={t('learnMore')}
          buttonLink="/products/analytics"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175853/website/photos/analyticsHome_l3hgcy.png"
          backgroundColor="bg-[#EDF3FF]"
          subtitleColor="text-black"
          subtitleBgColor="bg-white"
        />
      </MotionSection>

      {/* Reversible Content Section 2 */}
      <MotionSection>
        <ReversibleContentSection
          title={t('apiTitle')}
          subtitle={t('airQualityAPI')}
          description={t('apiDescription')}
          buttonText={t('getStartedHere')}
          buttonLink="/products/api"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png"
          reverse={false}
          backgroundColor="bg-transparent"
          leftWidth="lg:w-1/3"
          rightWidth="lg:w-2/3"
        />
      </MotionSection>

      {/* Reversible Content Section 3 */}
      <MotionSection>
        <ReversibleContentSection
          title={t('mapTitle')}
          subtitle={t('airQualityMap')}
          description={t('mapDescription')}
          buttonText={t('viewMore')}
          buttonLink="https://analytics.airqo.net/map"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728178762/website/photos/mapHome_rq49ql.png"
          reverse={false}
          backgroundColor="bg-[#EDF3FF]"
          subtitleColor="text-black"
          subtitleBgColor="bg-white"
          imageClassName="object-cover rounded-xl"
        />
      </MotionSection>

      {/* App Download Section */}
      <MotionSection>
        <AppDownloadSection
          title={t('downloadApp')}
          description={t('appDescription')}
          appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
          googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
          mockupImage="https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071559/website/photos/wrapper_aum5qm.png"
        />
      </MotionSection>

      {/* Featured Carousel */}
      <MotionSection>
        <FeaturedCarousel />
      </MotionSection>
    </div>
  );
};

export default HomePage;
