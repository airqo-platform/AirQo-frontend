import React from 'react';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import { useSelector } from 'react-redux';
import HeaderImage from 'assets/img/cleanAir/headerImage.png';
import { BottomCTAS, HeaderComponent } from 'components/CleanAir';
import Loadspinner from 'components/LoadSpinner';

const CleanAirPageContainer = ({ children }) => {
  const { pressDataLoading, eventsDataLoading } = useSelector((state) => ({
    pressDataLoading: state.pressData.loading,
    eventsDataLoading: state.eventsData.loading
  }));

  if (pressDataLoading || eventsDataLoading) {
    return <Loadspinner />;
  }

  return (
    <div className="Page Clean-air-page">
      <TopBar />
      <HeaderComponent
        title="CLEAN-Air Africa Network"
        pageTitle="CLEAN-Air Africa Network"
        style={{
          backgroundImage: `url(${HeaderImage})`
        }}
      />
      <div className="page-wrapper page-container">{children}</div>
      <BottomCTAS />
      <Footer />
    </div>
  );
};

export default CleanAirPageContainer;
