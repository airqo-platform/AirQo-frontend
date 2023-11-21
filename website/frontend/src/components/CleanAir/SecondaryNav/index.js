import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../../../reduxStore/CleanAirNetwork/CleanAir';
import PropTypes from 'prop-types';

const SecondaryNavComponent = ({ disabledTabs }) => {
  const tabs = ['About', 'Membership', 'Events', 'Resources'];
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  useEffect(() => {
    setSelectedTab(activeTab)
  }, [])

  const handleTabClick = (tab) => {
    if (!disabledTabs.includes(tab)) {
      setSelectedTab(tab);
      dispatch(setActiveTab(tab));
    }
  };

  return (
    <div className="header-subnav">
      <ul className="tabs">
        {tabs.map((tab, index) => (
          <li
            key={index}
            className={`${selectedTab === index ? 'active' : ''} ${disabledTabs.includes(index) ? 'disabled' : ''
              }`}
            onClick={() => {
              handleTabClick(index);
              
            }}>
            <span>{tab}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

SecondaryNavComponent.propTypes = {
  disabledTabs: PropTypes.array
};

SecondaryNavComponent.defaultProps = {
  disabledTabs: []
};

export default SecondaryNavComponent;
