import React from 'react';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import { BottomCTAS, SecondaryNavComponent } from 'components/CleanAir';
import LanguageSwitcher from 'components/LanguageSwitcher';
import NewsletterSection from 'src/components/NewsletterSection/NewsletterSection';

const CleanAirPageContainer = ({
  children,
  showNewsLetter = false,
  showBottomCTAS = true,
  showSubNav = true,
}) => {
  return (
    <div className="Page">
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
