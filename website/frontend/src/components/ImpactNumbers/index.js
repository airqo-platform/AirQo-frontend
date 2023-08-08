import React from 'react';
import NetworkIcon from 'assets/svg/ImpactNumbers/Network.svg';
import CommunityIcon from 'assets/svg/ImpactNumbers/Community.svg';
import MonitorIcon from 'assets/svg/ImpactNumbers/Monitor.svg';
import ResearchIcon from 'assets/svg/ImpactNumbers/Publications.svg';
import PartnerIcon from 'assets/svg/ImpactNumbers/Partners.svg';
import RecordsIcon from 'assets/svg/ImpactNumbers/Records.svg';

const ImpactNumbers = () => {
  const numbers = [
    {
      icon: <NetworkIcon />,
      name: 'African cities',
      numbers: '8+'
    },
    {
      icon: <CommunityIcon />,
      name: 'Community Champions',
      numbers: '1500+'
    },
    {
      icon: <MonitorIcon />,
      name: 'Monitor Installations',
      numbers: '200+'
    },
    {
      icon: <RecordsIcon />,
      name: 'Data records',
      numbers: '67M+'
    },
    {
      icon: <ResearchIcon />,
      name: 'Research papers',
      numbers: '10+'
    },
    {
      icon: <PartnerIcon />,
      name: 'Partners',
      numbers: '300+'
    }
  ];
  return (
    <div className="impact-numbers">
      <div className="impact-numbers-wrapper">
        {numbers.map((number, key) => (
          <div key={key} className="impact-card">
            <div>{number.icon}</div>
            <div>
              <p className="numbers">{number.numbers}</p>
              <p className="category">{number.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactNumbers;
