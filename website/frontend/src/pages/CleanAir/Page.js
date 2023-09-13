import React from 'react';
import Footer from 'components/Footer';
import TopBar from 'components/nav/TopBar';
import BottomCTAs from 'components/CleanAir/CTAs/BottomCTAs';
import HeaderComponent from 'components/CleanAir/HomePage/Header';
import HeaderImage from 'assets/img/cleanAir/headerImage.png';

const CleanAirPageContainer = ({ children }) => {
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
      <BottomCTAs />
      <Footer />
    </div>
  );
};

export default CleanAirPageContainer;
