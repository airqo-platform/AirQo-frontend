import React from 'react';
import LocateIcon from '@material-ui/icons/AddLocation';
import Divider from '@material-ui/core/Divider';
// Icons
import Good from 'views/components/MapIcons/Good';
import Moderate from 'views/components/MapIcons/Moderate';
import Unhealthy from 'views/components/MapIcons/Unhealthy';
import UnhealthySensitive from 'views/components/MapIcons/UnhealthySen';
import VeryUnhealthy from 'views/components/MapIcons/VeryUnhealthy';
import Hazardous from 'views/components/MapIcons/Hazardous';
import ReactDOMServer from 'react-dom/server';

const MapPopup = (feature, showPollutant, pollutantValue, desc, duration, markerClass) => {
  const getIcon = () => {
    if (pollutantValue <= 12) {
      return <Good width={30} height={30} fill={'#000000'} />;
    } else if (pollutantValue <= 35.4) {
      return <Moderate width={30} height={30} fill={'#000000'} />;
    } else if (pollutantValue <= 55.4) {
      return <UnhealthySensitive width={30} height={30} fill={'#000000'} />;
    } else if (pollutantValue <= 150.4) {
      return <Unhealthy width={30} height={30} fill={'#000000'} />;
    } else if (pollutantValue <= 250.4) {
      return <VeryUnhealthy width={30} height={30} fill={'#000000'} />;
    } else if (pollutantValue >= 250.5) {
      return <Hazardous width={30} height={30} fill={'#000000'} />;
    }
  };

  const icon = ReactDOMServer.renderToString(getIcon());
  const DividerIcon = ReactDOMServer.renderToString(<Divider />);

  return `<div class="popup-body">
  <div>
    <span class="popup-title">
        <b>
        ${feature.properties.siteDetails.description}
        </b>
    </span>
  </div>
  ${DividerIcon}
  <div class="${`popup-aqi ${markerClass}`}"> 
    <div class="popup-aqi-icon">
        ${icon}
    </div>
    <div>
        ${desc}
    </div>
  </div>
  ${DividerIcon}
  <div class="popup-pollutant">
    <span class="popup-pollutant-title">
        <b>
        ${(showPollutant.pm2_5 && 'PM<sub>2.5<sub>') || (showPollutant.pm10 && 'PM<sub>10<sub>')}
        </b>
    </span>
    <span class="popup-pollutant-value">
    ${(pollutantValue && Math.floor(pollutantValue)) || '--'} µg/m<sup>3</sup>
    </span>
  </div>
  <span>Last Refreshed: <b>${duration}</b> ago</span>
</div>`;
};

export default MapPopup;
