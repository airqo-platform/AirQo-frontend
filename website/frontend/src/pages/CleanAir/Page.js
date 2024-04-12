import React from 'react';
import { useSelector } from 'react-redux';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import { BottomCTAS, SecondaryNavComponent } from 'components/CleanAir';
import Loadspinner from 'components/LoadSpinner';
import LanguageSwitcher from 'components/LanguageSwitcher';
import NewsletterSection from 'src/components/NewsletterSection/NewsletterSection';

const CleanAirPageContainer = ({
  children,
  showNewsLetter = false,
  showBottomCTAS = true,
  showSubNav = true
}) => {
  const eventsLoading = useSelector((state) => state.eventsData.loading);
  const resourcesLoading = useSelector((state) => state.cleanAirData.loading);

  if (eventsLoading && resourcesLoading) {
    return <Loadspinner />;
  }

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
