import React from 'react';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import { BottomCTAS, SecondaryNavComponent } from 'components/CleanAir';
import LanguageSwitcher from 'components/LanguageSwitcher';
import NewsletterSection from 'src/components/NewsletterSection/NewsletterSection';
import SEO from 'utilities/seo';

const CleanAirPageContainer = ({
  children,
  showNewsLetter = false,
  showBottomCTAS = true,
  showSubNav = true
}) => {
  return (
    <div className="Page">
      <SEO
        title="Clean Air Network Africa | AirQo"
        siteTitle="AirQo Africa"
        description="Join the Clean Air Network Africa, powered by AirQo. Discover innovative solutions, collaborate with experts, and contribute to improving air quality across African cities. Access real-time data, research, and community initiatives for a healthier urban environment."
        canonicalUrl="https://airqo.africa/clean-air"
        image="https://res.cloudinary.com/dbibjvyhm/image/upload/v1726581126/website/photos/section3_fi4l2l.webp"
        keywords="Clean Air Network, Africa air quality, urban pollution solutions, environmental health, AirQo initiatives, smart cities, air monitoring, community engagement"
        article={false}
      />
      <LanguageSwitcher />
      <TopBar />
      <div className="Clean-air-page">
        {showSubNav && <SecondaryNavComponent />}
        <div className="page-wrapper page-container">{children}</div>
        {showBottomCTAS && <BottomCTAS />}
      </div>
      {showNewsLetter && <NewsletterSection />}
      <Footer />
    </div>
  );
};

export default CleanAirPageContainer;
