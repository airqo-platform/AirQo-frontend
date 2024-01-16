import React from 'react';
import { useSelector } from 'react-redux';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import { BottomCTAS, SecondaryNavComponent } from 'components/CleanAir';
import Loadspinner from 'components/LoadSpinner';
import LanguageSwitcher from 'components/LanguageSwitcher';

const CleanAirPageContainer = ({ children }) => {
  const { pressDataLoading, eventsDataLoading } = useSelector((state) => ({
    pressDataLoading: state?.pressData?.loading,
    eventsDataLoading: state?.eventsData?.loading
  }));

  if (pressDataLoading && eventsDataLoading) {
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
