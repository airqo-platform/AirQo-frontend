import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../../../reduxStore/CleanAirNetwork/CleanAir';
import PropTypes from 'prop-types';

const SecondaryNavComponent = ({ disabledTabs }) => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);

  useEffect(() => {
    dispatch(setActiveTab(0));
  }, [dispatch]);

  const handleTabClick = (index) => {
    if (!disabledTabs.includes(index)) {
      dispatch(setActiveTab(index));
    }
  };

  const tabs = ['About', 'Membership', 'Events', 'Resources'];

  return (
    <div className="header-subnav">
      <ul className="tabs">
        {tabs.map((tab, index) => (
          <li
            key={index}
            className={`${activeTab === index ? 'active' : ''} ${
              disabledTabs.includes(index) ? 'disabled' : ''
            }`}
            onClick={() => handleTabClick(index)}>
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
