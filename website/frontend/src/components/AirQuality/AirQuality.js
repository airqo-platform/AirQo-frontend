import React, { useState } from 'react';
import AfricanCities from './AfricanCities';
import Communities from './Communities';
import { useTranslation } from 'react-i18next';

const AirQuality = () => {
  const [selectedTab, setSelectedTab] = useState('AfricanCities');
  const onClickTabItem = (tab) => setSelectedTab(tab);
  const { t } = useTranslation();

  return (
    <div className="airquality-section">
      <div className="backdrop">
        <div className="header">
          <h2>{t("homepage.airQuality.title")} </h2>
          <p>
            {t("homepage.airQuality.subText")}
          </p>
          <div className="tabs">
            <div className={selectedTab === 'AfricanCities' ? 'tab tab-selected' : 'tab'}>
              <span
                name="AfricanCities"
                onClick={() => onClickTabItem('AfricanCities')}>
                {t('navbar.solutions.subnav.cities.name')}
              </span>
            </div>
            <div className={selectedTab === 'Communities' ? 'tab tab-selected' : 'tab'}>
              <span
                name="Communities"
                onClick={() => onClickTabItem('Communities')}>
                {t('navbar.solutions.subnav.communities.name')}
              </span>
            </div>
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
