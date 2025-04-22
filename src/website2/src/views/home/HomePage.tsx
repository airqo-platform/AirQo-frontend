'use client';
import { motion, useInView } from 'framer-motion';
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
          title="High-resolution air quality monitoring network"
          subtitle="Air Quality Monitor"
          description="We deploy a high-resolution air quality monitoring network in target urban areas across Africa to increase awareness and understanding of air quality management, provide actionable information, and derive actions against air pollution."
          buttonText="Learn more"
          buttonLink="/products/monitor"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175985/website/photos/monitorHome_dmmrsk.png"
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

      {/* The clean air Forum */}
      <MotionSection>
        <ReversibleContentSection
          title="CLEAN‑Air Forum"
          subtitle="Africa’s Premier Air Quality Community"
          description="Connect with researchers, policymakers and innovators driving real‑world solutions to air pollution across Africa. Share data, discuss strategies and collaborate on initiatives that improve the air we breathe."
          buttonText="Explore the Forum"
          buttonLink="/clean-air-forum/about"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1745330007/website/cleanAirForum/images/clean_air_forum2_isybcv.png"
          reverse={false}
          backgroundColor="bg-[#EDF3FF]"
          subtitleColor="text-black"
          subtitleBgColor="bg-white"
          imageClassName="object-cover object-center rounded-xl"
        />
      </MotionSection>

      {/* The clean air network */}
      <MotionSection>
        <ReversibleContentSection
          title="The CLEAN-Air Network"
          subtitle="Air Quality Network"
          description={
            <div>
              <span className="text-blue-700 font-medium">
                An African-led, multi-regional network
              </span>
              <br />
              bringing together a community of practice for air quality
              solutions and air quality management across Africa.
            </div>
          }
          buttonText="Join the Network"
          buttonLink="/clean-air-network/about"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp"
          backgroundColor="bg-transparent"
          reverse={true}
          imageClassName="object-cover rounded-xl"
        />
      </MotionSection>

      {/* Reversible Content Section 3 */}
      <MotionSection>
        <ReversibleContentSection
          title="Live air quality insights across Africa"
          subtitle="Air Quality Map"
          description="Visualize hourly air quality information with a single click, over our growing network across African cities"
          buttonText="View more"
          buttonLink="https://analytics.airqo.net/map"
          imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png"
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
