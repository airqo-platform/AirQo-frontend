import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../../../reduxStore/CleanAirNetwork/CleanAir';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

/**
 * @description Secondary navigation component for the CleanAir site
 * @param {Array} disabledTabs
 * @returns {JSX.Element}
 */
const SecondaryNavComponent = ({ disabledTabs }) => {
  const { t } = useTranslation();
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);
  const tabs = [
    t('cleanAirSite.subNav.about'),
    t('cleanAirSite.subNav.membership'),
    t('cleanAirSite.subNav.events'),
    t('cleanAirSite.subNav.resources')
  ];
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(setActiveTab(tabs[0]));
    const currentTab = tabs.findIndex((tab) => location.pathname.includes(tab.toLowerCase()));
    if (currentTab !== -1 && !disabledTabs.includes(currentTab)) {
      dispatch(setActiveTab(tabs[currentTab]));
    }
  }, [location, dispatch, tabs, disabledTabs]);

  return (
    <div className="header-subnav">
      <ul className="tabs">
        {tabs.map((tab, index) => (
          <Link to={`/clean-air/${tab.toLowerCase()}`} key={index}>
            <li
              className={`${
                location.pathname.includes(tab.toLowerCase()) || activeTab === tab ? 'active' : ''
              } ${disabledTabs.includes(index) ? 'disabled' : ''}`}
              onClick={() => {
                if (!disabledTabs.includes(index)) {
                  dispatch(setActiveTab(tab));
                }
              }}>
              <span>{tab}</span>
            </li>
          </Link>
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
