import React, { useState } from 'react';
import AfricanCities from './AfricanCities';
import Communities from './Communities';
import { useTranslation } from 'react-i18next';

/**
 * Tab component
 * @param {Object} props
 */
const Tab = ({ name, selectedTab, selectName, onClickTabItem }) => {
  const { t } = useTranslation();
  const className = selectedTab === selectName ? 'tab tab-selected' : 'tab';

  return (
    <div className={className}>
      <span name={selectName} onClick={() => onClickTabItem(selectName)}>
        {t(`navbar.solutions.subnav.${name}.name`)}
      </span>
    </div>
  );
};

const AirQuality = () => {
  const [selectedTab, setSelectedTab] = useState('AfricanCities');
  const { t } = useTranslation();

  return (
    <div className="airquality-section">
      <div className="backdrop">
        <div className="header">
          <h2>{t('homepage.airQuality.title')}</h2>
          <p>{t('homepage.airQuality.subText')}</p>
          <div className="tabs">
            <Tab
              name="cities"
              selectName="AfricanCities"
              selectedTab={selectedTab}
              onClickTabItem={setSelectedTab}
            />
            <Tab
              name="communities"
              selectName="Communities"
              selectedTab={selectedTab}
              onClickTabItem={setSelectedTab}
            />
          </div>
        </div>
        <div className="content">
          {selectedTab === 'AfricanCities' ? <AfricanCities /> : <Communities />}
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
