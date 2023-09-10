import React from 'react';
import TopBarNav from 'src/components/CleanAir/TopBarNav';
import Footer from 'src/components/Footer';

const CleanAirPageContainer = ({ children }) => {
  return (
    <div className="Page Clean-air-page">
      <TopBarNav />
      <div className="page-wrapper page-container">{children}</div>
      <Footer />
    </div>
  );
};

export default CleanAirPageContainer;
