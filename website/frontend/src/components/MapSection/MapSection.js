import React from 'react';
import HomePageMap from 'assets/img/homepage-map.png';
import MapWrapper from 'assets/img/MapWrapper.png';
import useWindowSize from 'utilities/customHooks';
import { Link } from 'react-router-dom';
import { NETMANAGER_URL } from '../../../config/urls';
import { useTranslation } from 'react-i18next';

const MapSection = () => {
  const windowSize = useWindowSize();
  const largeScreen = 1440;
  const { t } = useTranslation();
  return (
    <div className="map-section">
      <div className="backdrop">
        <div className="map-content">
          <span id="first-pill">
            <p>{t("homepage.mapSection.pill")}</p>
          </span>
          <h3 className="content-h">{t("homepage.mapSection.title")}</h3>
          <span className="content-p">
            <p>{t("homepage.mapSection.subText")}
            </p>
          </span>
          <Link to={`${NETMANAGER_URL}/map`} target='_blank'>
            <span id="second-pill">
              <p>{t("homepage.mapSection.cta")} {'-->'}</p>
            </span>
          </Link>
        </div>
        <div className="map-image">
          <img
            className="map-img"
            src={windowSize.width <= largeScreen ? HomePageMap : MapWrapper}
          />
        </div>
      </div>
    </div>
  );
};

export default MapSection;
