import React, { useEffect } from 'react';
import NetworkIcon from 'assets/svg/ImpactNumbers/Network.svg';
import CommunityIcon from 'assets/svg/ImpactNumbers/Community.svg';
import MonitorIcon from 'assets/svg/ImpactNumbers/Monitor.svg';
import ResearchIcon from 'assets/svg/ImpactNumbers/Publications.svg';
import PartnerIcon from 'assets/svg/ImpactNumbers/Partners.svg';
import RecordsIcon from 'assets/svg/ImpactNumbers/Records.svg';
import { useDispatch, useSelector } from 'react-redux';
import { getAllImpactNumbers } from '../../../reduxStore/ImpactNumbers/ImpactSlice';
import { isEmpty } from 'underscore';

const ImpactNumbers = () => {
  const dispatch = useDispatch()
  const numbersData = useSelector((state) => state.impactData.numbers)
  const numbers = [
    {
      icon: <NetworkIcon />,
      name: 'African cities',
      numbers: `${numbersData.map((numbers) => numbers.african_cities)}+`
    },
    {
      icon: <CommunityIcon />,
      name: 'Community Champions',
      numbers: `${numbersData.map((numbers) => numbers.champions)}+`
    },
    {
      icon: <MonitorIcon />,
      name: 'Monitor Installations',
      numbers: `${numbersData.map((numbers) => numbers.deployed_monitors)}+`
    },
    {
      icon: <RecordsIcon />,
      name: 'Data records',
      numbers: `${numbersData.map((numbers) => numbers.data_records)}M+`
    },
    {
      icon: <ResearchIcon />,
      name: 'Research papers',
      numbers: `${numbersData.map((numbers) => numbers.research_papers)}+`
    },
    {
      icon: <PartnerIcon />,
      name: 'Partners',
      numbers: `${numbersData.map((numbers) => numbers.partners)}+`
    }
  ];

  useEffect(() => {
    if (isEmpty(numbersData)) {
      dispatch(getAllImpactNumbers());
    }
  }, [dispatch]);
  
  return (
    <div className="impact-numbers">
      <div className="impact-numbers-wrapper">
        {numbers.map((number, key) => (
          <div key={key} className="impact-card">
            <div>
              <p className="numbers">{number.numbers}</p>
              <p className="category">{number.name}</p>
            </div>
            <div>{number.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactNumbers;
