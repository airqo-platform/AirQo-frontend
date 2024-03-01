// icon images
export const images = {
  GoodAir: '/images/map/GoodAir.png',
  ModerateAir: '/images/map/Moderate.png',
  UnhealthyForSensitiveGroups: '/images/map/UnhealthySG.png',
  Unhealthy: '/images/map/Unhealthy.png',
  VeryUnhealthy: '/images/map/VeryUnhealthy.png',
  Hazardous: '/images/map/Hazardous.png',
  Unknown: '/images/map/UnknownAQ.png',
};

export const getIcon = (aqiValue) => {
  if (aqiValue > 300) {
    return 'Hazardous';
  } else if (aqiValue > 200) {
    return 'VeryUnhealthy';
  } else if (aqiValue > 150) {
    return 'Unhealthy';
  } else if (aqiValue > 100) {
    return 'UnhealthyForSensitiveGroups';
  } else if (aqiValue > 50) {
    return 'ModerateAir';
  } else {
    return 'GoodAir';
  }
};

// Cluster Html
export const createClusterHTML = ({ feature, images }) => {
  return `
    <div class="flex -space-x-3 rtl:space-x-reverse">
      <img class="w-8 h-8 border-2 border-white rounded-full z-20" src="${images['GoodAir']}" alt="AQI Icon">
      <img class="w-8 h-8 border-2 border-white rounded-full z-10" src="${images['VeryUnhealthy']}" alt="AQI Icon">
    </div>
    <div class="text-black text-sm font-bold ml-2">${feature.properties.point_count_abbreviated} + </div>
  `;
};

// Map Popup modal
export const createPopupHTML = ({ feature, images }) => {
  return `
    <div class="flex flex-col gap-2 break-all shadow-sm">
      <div class="flex items-center gap-2">
        <img src="${images[feature.properties.aqi]}" alt="AQI Icon" class="w-8 h-8">
        <div class="text-lg font-bold">${feature.properties.aqi}</div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <div class="text-gray-500">PM2.5:</div>
          <div class="text-black font-bold">${feature.properties.pm2_5}</div>
        </div>
        <div class="flex items-center gap-1">
          <div class="text-gray-500">PM10:</div>
          <div class="text-black font-bold">${feature.properties.pm10}</div>
        </div>
        <div class="flex items-center gap-1">
          <div class="text-gray-500">NO2:</div>
          <div class="text-black font-bold">${feature.properties.no2}</div>
        </div>
      </div>
      <div class="text-gray-500">Last updated: ${new Date(
        feature.properties.createdAt,
      ).toLocaleString()}</div>
    </div>
  `;
};
