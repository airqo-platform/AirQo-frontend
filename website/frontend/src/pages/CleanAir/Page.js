import React from 'react';
import { useSelector } from 'react-redux';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import { BottomCTAS, SecondaryNavComponent } from 'components/CleanAir';
import Loadspinner from 'components/LoadSpinner';
import LanguageSwitcher from 'components/LanguageSwitcher';

const CleanAirPageContainer = ({ children }) => {
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
        <SecondaryNavComponent />
        <div className="page-wrapper page-container">{children}</div>
        <BottomCTAS />
      </div>
      <Footer />
    </div>
  );
};

export default CleanAirPageContainer;
