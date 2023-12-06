import React from 'react';
import LocateIcon from '@material-ui/icons/AddLocation';
// Icons
import Good from 'views/components/MapIcons/Good';
import Moderate from 'views/components/MapIcons/Moderate';
import Unhealthy from 'views/components/MapIcons/Unhealthy';
import UnhealthySensitive from 'views/components/MapIcons/UnhealthySen';
import VeryUnhealthy from 'views/components/MapIcons/VeryUnhealthy';
import Hazardous from 'views/components/MapIcons/Hazardous';

const MapPopup = (feature, showPollutant, pollutantValue, desc, duration, markerClass) => {
  return `<div class="popup-body">
    <div>
      <span class="popup-title">
        <b>${feature.properties.siteDetails.description}</b>
      </span>
    </div>
    <div class="${`popup-aqi ${markerClass}`}"> 
      <span>
      ${(showPollutant.pm2_5 && 'PM<sub>2.5<sub>') || (showPollutant.pm10 && 'PM<sub>10<sub>')}
      </span> </hr>  
      <div class="pollutant-info">
        <div class="pollutant-info-row">
        <div class="pollutant-number">${
          (pollutantValue && Math.floor(pollutantValue)) || '--'
        }</div>
        <div class="popup-measurement">µg/m<sup>3</sup></div>
        </div> 
        <div class="pollutant-desc">${desc}</div>
      </div>
    </div>
    <span>Last Refreshed: <b>${duration}</b> ago</span>
  </div>`;
};

export default MapPopup;
