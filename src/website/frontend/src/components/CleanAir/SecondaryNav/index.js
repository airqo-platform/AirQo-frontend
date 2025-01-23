import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../../../reduxStore/CleanAirNetwork';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const SecondaryNavComponent = ({ disabledTabs }) => {
  const { t } = useTranslation();
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);
  const tabs = [
    { label: t('cleanAirSite.subNav.about'), linkName: 'about' },
    { label: t('cleanAirSite.subNav.membership'), linkName: 'membership' },
    { label: t('cleanAirSite.subNav.events'), linkName: 'events' },
    { label: t('cleanAirSite.subNav.resources'), linkName: 'resources' }
  ];

  const dispatch = useDispatch();
  const location = useLocation();
  useEffect(() => {
    const currentTab = tabs.findIndex((tab) => location.pathname.includes(tab.linkName));
    if (currentTab !== -1 && !disabledTabs.includes(currentTab)) {
      dispatch(setActiveTab(tabs[currentTab]));
    }
  }, [location]);

  return (
    <div className="header-subnav">
      <ul className="tabs">
        {tabs.map((tab, index) => (
          <Link to={`/clean-air/${tab.linkName}`} key={index}>
            <li
              className={`${
                location.pathname.includes(tab.linkName) || activeTab === index ? 'active' : ''
              } ${disabledTabs.includes(index) ? 'disabled' : ''}`}
              onClick={() => {
                if (!disabledTabs.includes(index)) {
                  dispatch(setActiveTab(tab));
                }
              }}>
              <span>{tab.label}</span>
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
