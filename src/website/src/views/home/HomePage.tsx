import React from 'react';

import ReversibleContentSection from '@/components/sections/ReversibleContentSection';

import AnalyticsContentSection from './AnalyticsContentSection';
import AppDownloadSection from './AppDownloadSection';
import HomeDeferredSections from './HomeDeferredSections';
import HomePlayerSection from './HomePlayerSection';

const HomePage = () => {
  return (
    <div className="space-y-20">
      {/* Home Player Section */}
      <HomePlayerSection />

      <HomeDeferredSections />

      {/* Reversible Content Section 1 */}
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

      {/* Analytics Content Section */}
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

      {/* Reversible Content Section 2 */}
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

      {/* Network Coverage */}
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

      {/* The clean air Forum */}
      <ReversibleContentSection
        title="Africa Clean Air Forum 2026"
        subtitle="Africa’s Premier Air Quality Community"
        description={
          <>
            <div style={{ marginBottom: '1rem' }}>
              The Africa Clean Air Forum is the flagship event of the Africa
              Clean Air Network (AfriCAN). It serves as a platform to convene
              policymakers, academia, industry, media and civil society
              organisations to foster knowledge sharing, collaboration, and
              cross-border partnerships to address air pollution across Africa.
            </div>
            <div>
              The Africa Clean Air Forum 2026 will convene experts at the
              forefront of air quality science to explore how data, modelling,
              monitoring technologies, and emerging tools can inform
              decision-making and long-term investment across the continent.
            </div>
          </>
        }
        buttonText="Learn more"
        buttonLink="https://cleanairafrica.org/events/annual-forum-2026-pretoria/"
        imageUrl="https://res.cloudinary.com/dbibjvyhm/image/upload/v1772537998/website/photos/Clean-Air-Forum-Save-the-Date_1_xgtbul.png"
        reverse={false}
        backgroundColor="bg-[#EDF3FF]"
        subtitleColor="text-black"
        subtitleBgColor="bg-white"
        imageClassName="object-cover object-center rounded-xl"
      />

      {/* App Download Section */}
      <AppDownloadSection
        title="Download the app"
        description="Discover the quality of air you are breathing"
        appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
        googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
        mockupImage="https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png"
      />
    </div>
  );
};

export default HomePage;
