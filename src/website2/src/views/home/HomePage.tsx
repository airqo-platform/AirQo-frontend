'use client';
import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
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

      {/* Air Quality Billboard */}
      <MotionSection>
        <AirQualityBillboard homepage className="md:px-3" />
      </MotionSection>

      {/* Reversible Content Section 1 */}
      <MotionSection>
        <ReversibleContentSection
          title="Binos Air Quality Monitor – Built for African Cities"
          subtitle="Air Quality Monitor"
          description="Our Binos Air Quality Monitors are designed, manufactured, and calibrated specifically for African urban environments. Optimized to withstand extreme weather, high dust, and heat, these locally built monitors provide accurate, AI-calibrated air quality data. Easy to install on buildings or motorcycle taxis, they enable high-resolution, mobile monitoring to fill data gaps across cities. Powered by solar or mains electricity and operating on reliable 2G networks, Binos Monitors deliver actionable insights to support effective air quality management across Africa. "
          buttonText="Learn more"
          buttonLink="/products/monitor"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1757020397/website/photos/monitorHome_dmmrsk_tof2wo.webp"
          reverse={false}
          backgroundColor="bg-transparent"
        />
      </MotionSection>

      {/* Analytics Content Section */}
      <MotionSection>
        <AnalyticsContentSection
          title="An interactive air quality analytics platform"
          subtitle="Air Quality Analytics"
          description="Access and visualise real-time and historical air quality information across Africa through our easy-to-use air quality analytics dashboard."
          buttonText="Learn more"
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
          title="Amplify air quality impact through our API"
          subtitle="Air Quality API"
          description="Are you a developer? We invite you to leverage our open-air quality data on your App"
          buttonText="Get started here"
          buttonLink="/products/api"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png"
          reverse={false}
          backgroundColor="bg-transparent"
          leftWidth="lg:w-1/3"
          rightWidth="lg:w-2/3"
        />
      </MotionSection>

      {/* Network Coverage */}
      <MotionSection>
        <ReversibleContentSection
          title="Discover Our Network Coverage"
          subtitle="Network Coverage"
          description={
            <div>
              Explore the locations of our air quality monitoring stations
              deployed across major cities and regions in Africa.
            </div>
          }
          buttonText="View Network Coverage"
          buttonLink="/solutions/network-coverage"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png"
          backgroundColor="bg-transparent"
          reverse={true}
          imageClassName="object-cover rounded-xl"
        />
      </MotionSection>

      {/* The clean air Forum */}
      <MotionSection>
        <ReversibleContentSection
          title="CLEAN-Air Forum 2025, Nairobi, Kenya"
          subtitle="Africa’s Premier Air Quality Community"
          description={
            <>
              <div style={{ marginBottom: '1rem' }}>
                The CLEAN-Air Forum is an annual convening for the communities
                of practice in Africa, started in Kampala in 2023, as a platform
                for knowledge sharing and multi-regional partnerships for
                tackling air pollution in African cities.
              </div>
              <div>
                CLEAN-Air Forum 2025, Nairobi, held under the theme
                “Partnerships for Clean Air Solutions,” aims to strengthen
                cross-border transdisciplinary partnerships, promote
                evidence-based approaches, and build capacity to advance clean
                air solutions in Africa.
              </div>
            </>
          }
          buttonText="Explore the Forum"
          buttonLink="/clean-air-forum"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg"
          reverse={false}
          backgroundColor="bg-[#EDF3FF]"
          subtitleColor="text-black"
          subtitleBgColor="bg-white"
          imageClassName="object-cover object-center rounded-xl"
        />
      </MotionSection>

      {/* App Download Section */}
      <MotionSection>
        <AppDownloadSection
          title="Download the app"
          description="Discover the quality of air you are breathing"
          appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
          googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
          mockupImage="https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png"
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
