import React from 'react';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import AppDownloadSection from './AppDownloadSection';
import EarthshotFinalistSection from './EarthshotFinalistSection';
import HomeCTA from './HomeCTA';
import HomeNetworkCoverageDeferred from './HomeNetworkCoverageDeferred';
import HomePlayerSection from './HomePlayerSection';
import HomePublicationsSection from './HomePublicationsSection';
import HomeStatsSection from './HomeStatsSection';
import ProductEcosystem from './ProductEcosystem';

const images = {
  mobileAppMockup: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
    { width: 800 },
  ),
};

const HomePage = () => {
  return (
    <div>
      {/* Editorial hero */}
      <HomePlayerSection />

      {/* Earthshot Finalist Announcement – top-level recognition */}
      <EarthshotFinalistSection />

      {/* Product ecosystem: Measure / Understand / Act */}
      <ProductEcosystem />

      {/* Live network coverage */}
      <HomeNetworkCoverageDeferred />

      {/* Impact evidence */}
      <HomeStatsSection />

      {/* App Download Section */}
      <AppDownloadSection
        title="Download the app"
        description="Discover the quality of air you are breathing"
        appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
        googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
        mockupImage={images.mobileAppMockup}
      />

      {/* Latest curated and live research publications */}
      <HomePublicationsSection />

      {/* Closing CTA */}
      <HomeCTA />
    </div>
  );
};

export default HomePage;
