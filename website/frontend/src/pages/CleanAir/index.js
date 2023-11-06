import React from 'react';
import { useSelector } from 'react-redux';
import CleanAirPageContainer from './Page';
import CleanAirAbout from './CleanAirAbout';
import CleanAirPartners from './CleanAirPartners';
import CleanAirEvents from './CleanAirEvents';
import GetInvolved from './GetInvolved';

const CleanAirPage = () => {
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);

  return (
    <CleanAirPageContainer>
      {activeTab === 0 && <CleanAirAbout />}
      {activeTab === 1 && <CleanAirPartners />}
      {activeTab === 2 && <CleanAirEvents />}
      {activeTab === 3 && <GetInvolved />}
    </CleanAirPageContainer>
  );
};

export default CleanAirPage;
