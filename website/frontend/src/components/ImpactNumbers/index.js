import React from 'react';
import NetworkIcon from 'assets/svg/ImpactNumbers/Network.svg';
import CommunityIcon from 'assets/svg/ImpactNumbers/Community.svg';
import MonitorIcon from 'assets/svg/ImpactNumbers/Monitor.svg';
import ResearchIcon from 'assets/svg/ImpactNumbers/Publications.svg';

const ImpactNumbers = () => {
  const numbers = [
    {
      icon: <NetworkIcon />,
      name: 'Network',
      numbers: '6+ African Countries </br> 8+ African Cities',
      subtext: 'Closing the air quality data gap by making air quality monitoring possible.'
    },
    {
      icon: <CommunityIcon />,
      name: 'Community',
      numbers: '1500+ Air quality champions',
      subtext: 'Empowering community members to be air quality champions.'
    },
    {
      icon: <MonitorIcon />,
      name: 'Air Quality Monitor',
      numbers: '250+ installations across Africa</br> 67M+ data records collected',
      subtext: 'Using low-cost air quality monitors to improve access to air quality data.'
    },
    {
      icon: <ResearchIcon />,
      name: 'Research',
      numbers: '10+ Peer-reviewed and white papers published',
      subtext: 'Research to develop evidence-based air quality control strategies in Africa.'
    },
    {
      icon: <CommunityIcon />,
      name: 'Partners',
      numbers: '300+ Partnerships advancing air quality management',
      subtext:
        'Local and international Organizations. Local and National governments and municipalities.'
    },
    {
      icon: <MonitorIcon />,
      name: 'Policy',
      numbers: 'Developing clean air action plans and air quality regulations',
      subtext:
        'Contribution to a clean air Action Plan with Kampala City Council Authority, a blueprint for other African cities.'
    },
    {
      icon: <NetworkIcon />,
      name: 'Collocation',
      numbers: 'Established the first public Collocation infrastructure (‘pole of unity’)',
      subtext: 'Working with UNEP to support air quality research outputs and data reliability.'
    }
  ];
  return (
    <div className="impact-numbers">
      {numbers.map((number, key) => (
        <div key={key} className="list-card">
          <div className="left">
            {number.icon}
            <p>{number.name}</p>
          </div>
          <div className="right">
            <p dangerouslySetInnerHTML={{ __html: number.numbers }}></p>
            <div className="subtext">{number.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImpactNumbers;
