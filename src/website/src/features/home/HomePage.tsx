import React from 'react';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import AppDownloadSection from './AppDownloadSection';
import EarthshotFinalistSection from './EarthshotFinalistSection';
import HomeDeferredSections from './HomeDeferredSections';
import HomeNetworkCoverageDeferred from './HomeNetworkCoverageDeferred';
import HomePlayerSection from './HomePlayerSection';
import ProductsShowcase from './ProductsShowcase';

const images = {
  mobileAppMockup: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
    { width: 800 },
  ),
};

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Home Player Section */}
      <HomePlayerSection />

      {/* Earthshot Finalist Announcement – top-level recognition */}
      <EarthshotFinalistSection />

      {/* Live network coverage */}
      <HomeNetworkCoverageDeferred />

      {/* Platform products showcase */}
      <ProductsShowcase />

      {/* Deferred sections: stats, billboard, featured carousel */}
      <HomeDeferredSections />

      {/* App Download Section */}
      <AppDownloadSection
        title="Download the app"
        description="Discover the quality of air you are breathing"
        appStoreLink="https://apps.apple.com/ug/app/airqo-air-quality/id1337573091"
        googlePlayLink="https://play.google.com/store/apps/details?id=com.airqo.app"
        mockupImage={images.mobileAppMockup}
      />
    </div>
  );
};

export default HomePage;
