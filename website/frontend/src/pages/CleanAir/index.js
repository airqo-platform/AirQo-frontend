import React from 'react';
import { useSelector } from 'react-redux';
import CleanAirPageContainer from './Page';
import Header from 'src/components/CleanAir/HomePage/Header';
import { About, Memberships, Press, ForYou } from 'src/components/CleanAir';

const CleanAirPage = () => {
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);

  return (
    <CleanAirPageContainer>
      <Header
        title="CLEAN-Air Africa Network"
        pageTitle="CLEAN-Air Africa Network"
        style={{
          backgroundImage: `url(${require('assets/img/cleanAir/headerImage.png')})`
        }}
      />
      {activeTab === 0 && <About />}
      {activeTab === 1 && <Memberships />}
      {activeTab === 2 && <Press />}
      {activeTab === 3 && <ForYou />}
    </CleanAirPageContainer>
  );
};

export default CleanAirPage;
