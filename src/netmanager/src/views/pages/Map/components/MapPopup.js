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

const MapPopup = (feature, showPollutant, pollutantValue, desc, duration, seconds, markerClass) => {
  const MAX_OFFLINE_DURATION = 86400; // 24 HOURS
  const getIcon = (Value, Pollutant) => {
    let markerDetails;
    if (Pollutant.pm2_5) {
      markerDetails = {
        0.0: <Good width={30} height={30} fill={'#000000'} />,
        12.1: <Moderate width={30} height={30} fill={'#000000'} />,
        35.5: <UnhealthySensitive width={30} height={30} fill={'#000000'} />,
        55.5: <Unhealthy width={30} height={30} fill={'#000000'} />,
        150.5: <VeryUnhealthy width={30} height={30} fill={'#000000'} />,
        250.5: <Hazardous width={30} height={30} fill={'#000000'} />
        // 500.5: <Invalid width={30} height={30} fill={'#000000'} />
      };
    } else {
      markerDetails = {
        0.0: <Good width={30} height={30} fill={'#000000'} />,
        54.1: <Moderate width={30} height={30} fill={'#000000'} />,
        154.1: <UnhealthySensitive width={30} height={30} fill={'#000000'} />,
        254.1: <Unhealthy width={30} height={30} fill={'#000000'} />,
        354.1: <VeryUnhealthy width={30} height={30} fill={'#000000'} />,
        424.1: <Hazardous width={30} height={30} fill={'#000000'} />
        // 604.1: <Invalid width={30} height={30} fill={'#000000'} />
      };
    }

    const keys = Object.keys(markerDetails);
    for (let i = 0; i < keys.length; i++) {
      if (Value < keys[i]) {
        return markerDetails[keys[i - 1]];
      }
    }
    return markerDetails[keys[keys.length - 1]];
  };

  const icon = ReactDOMServer.renderToString(getIcon(pollutantValue, showPollutant));
  const DividerIcon = ReactDOMServer.renderToString(<Divider />);

  const date = new Date(feature.properties.time);
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  const formattedDate = date.toLocaleString('en-US', options);

  return `<div class="popup-body">
  <div>
    <span class="popup-title">
        <b>
        ${feature.properties.siteDetails.description}
        </b>
    </span>
  </div>
  ${DividerIcon}
  
  ${
    pollutantValue !== null && pollutantValue !== undefined
      ? `
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
    ${(pollutantValue && pollutantValue.toFixed(1)) || '--'} µg/m<sup>3</sup>
    </span>
  </div>`
      : `<div class="popup-pollutant">
    <span class="popup-pollutant-noData">
        <b>
        Sorry, No data available
        </b>
    </span>
  </div>`
  }
  <span>Last Updated: <b>${duration}</b> ago</span>
  <span>${formattedDate}</span>

  ${DividerIcon}
  <div class="data-source">
  Source: ${feature.properties.siteDetails.data_provider}
  </div>
</div>`;
};

export default MapPopup;
