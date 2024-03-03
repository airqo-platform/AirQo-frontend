// icon images
export const images = {
  GoodAir: '/images/map/GoodAir.png',
  ModerateAir: '/images/map/Moderate.png',
  UnhealthyForSensitiveGroups: '/images/map/UnhealthySG.png',
  Unhealthy: '/images/map/Unhealthy.png',
  VeryUnhealthy: '/images/map/VeryUnhealthy.png',
  Hazardous: '/images/map/Hazardous.png',
};

export const getIcon = (aqiValue) => {
  if (aqiValue > 300) {
    return { icon: 'Hazardous', color: '#D95BA3' };
  } else if (aqiValue > 200) {
    return { icon: 'VeryUnhealthy', color: '#AC5CD9' };
  } else if (aqiValue > 150) {
    return { icon: 'Unhealthy', color: '#F7453C' };
  } else if (aqiValue > 100) {
    return { icon: 'UnhealthyForSensitiveGroups', color: '#FF851F' };
  } else if (aqiValue > 50) {
    return { icon: 'ModerateAir', color: '#FFD633' };
  } else {
    return { icon: 'GoodAir', color: '#34C759' };
  }
};

// Cluster Html
export const createClusterNode = ({ feature, images }) => {
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
    <div class="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-lg" style="min-width: 250px; width: max-content;">
      <div class="text-gray-500 text-xs">
        ${new Date(feature.properties.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        })}
      </div>
      <div class="flex justify-between gap-2 w-full items-center">
        <div class="flex items-center space-x-2">
          <div class="rounded-full bg-blue-500 w-3 h-3"></div>
          <div class="text-[#3C4555] font-medium text-[12px]">
            ${feature.properties.location}
          </div>
        </div>
        <div class="text-black font-bold text-lg">${feature.properties.pm2_5.toFixed(2)} µg/m³</div>
      </div>
      <div class="flex justify-between gap-5 items-center w-full">
        <p
          style="color: ${feature.properties.aqi.color}; font-size: 12px; font-weight: 500;"
        >Air Quality is ${feature.properties.airQuality}</p>    
        <img src="${images[feature.properties.aqi.icon]}" alt="AQI Icon" class="w-8 h-8">
      </div>
    </div>
  `;
};
