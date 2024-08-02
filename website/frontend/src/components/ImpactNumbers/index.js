import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllImpactNumbers } from '../../../reduxStore/ImpactNumbers/ImpactSlice';
import { isEmpty } from 'underscore';
import { useTranslation } from 'react-i18next';

import NetworkIcon from 'assets/svg/ImpactNumbers/Network.svg';
import CommunityIcon from 'assets/svg/ImpactNumbers/Community.svg';
import MonitorIcon from 'assets/svg/ImpactNumbers/Monitor.svg';
import ResearchIcon from 'assets/svg/ImpactNumbers/Publications.svg';
import PartnerIcon from 'assets/svg/ImpactNumbers/Partners.svg';
import RecordsIcon from 'assets/svg/ImpactNumbers/Records.svg';

const numbers = [
  {
    icon: <NetworkIcon />,
    name: 'homepage.impact.cities',
    numbers: 'african_cities',
  },
  {
    icon: <CommunityIcon />,
    name: 'homepage.impact.champions',
    numbers: 'champions',
  },
  {
    icon: <MonitorIcon />,
    name: 'homepage.impact.installs',
    numbers: 'deployed_monitors',
  },
  {
    icon: <RecordsIcon />,
    name: 'homepage.impact.records',
    numbers: 'data_records',
  },
  {
    icon: <ResearchIcon />,
    name: 'homepage.impact.research',
    numbers: 'research_papers',
  },
  {
    icon: <PartnerIcon />,
    name: 'homepage.impact.partners',
    numbers: 'partners',
  },
];

const ImpactNumbers = () => {
  const dispatch = useDispatch();
  const numbersData = useSelector((state) => state.impactData.numbers);
  const { t } = useTranslation();

  /**
   * Fetch impact numbers
   */
  useEffect(() => {
    if (isEmpty(numbersData)) {
      dispatch(getAllImpactNumbers());
    }
  }, [dispatch, numbersData]);

  return (
    <div className="impact-numbers">
      <div className="impact-numbers-wrapper">
        {numbers.map((number, key) => (
          <div key={key} className="impact-card">
            <div>
              <p className="numbers">{`${numbersData.map(
                (numbers) => numbers[number.numbers]
              )}+`}</p>
              <p className="category">{t(number.name)}</p>
            </div>
            <div>{number.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactNumbers;
