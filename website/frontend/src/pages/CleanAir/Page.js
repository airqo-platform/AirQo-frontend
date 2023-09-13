import React from 'react';
import TopBarNav from '../../components/CleanAir/TopBarNav';

const CleanAirPageContainer = ({ children }) => {
  return (
    <div className="Page Clean-air-page">
      <TopBar />
      <HeaderComponent />
      <div className="page-wrapper page-container">{children}</div>
      <BottomCTAs />
      <Footer />
    </div>
  );
};

export default CleanAirPageContainer;
