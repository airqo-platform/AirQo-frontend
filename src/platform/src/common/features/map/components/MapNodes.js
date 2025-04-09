import { renderToString } from 'react-dom/server';

import GoodAir from '@/icons/Charts/GoodAir';
import ModerateAir from '@/icons/Charts/Moderate';
import UnhealthyForSensitiveGroups from '@/icons/Charts/UnhealthySG';
import Unhealthy from '@/icons/Charts/Unhealthy';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import Hazardous from '@/icons/Charts/Hazardous';
import Invalid from '@/icons/Charts/Invalid';

// icon images
export const images = {
  GoodAir: `data:image/svg+xml,${encodeURIComponent(renderToString(<GoodAir />))}`,
  ModerateAir: `data:image/svg+xml,${encodeURIComponent(renderToString(<ModerateAir />))}`,
  UnhealthyForSensitiveGroups: `data:image/svg+xml,${encodeURIComponent(renderToString(<UnhealthyForSensitiveGroups />))}`,
  Unhealthy: `data:image/svg+xml,${encodeURIComponent(renderToString(<Unhealthy />))}`,
  VeryUnhealthy: `data:image/svg+xml,${encodeURIComponent(renderToString(<VeryUnhealthy />))}`,
  Hazardous: `data:image/svg+xml,${encodeURIComponent(renderToString(<Hazardous />))}`,
  Invalid: `data:image/svg+xml,${encodeURIComponent(renderToString(<Invalid />))}`,
  undefined: `data:image/svg+xml,${encodeURIComponent(renderToString(<Invalid />))}`,
};

const markerDetails = {
  pm2_5: [
    { limit: 500.5, category: 'Invalid' },
    { limit: 225.5, category: 'Hazardous' },
    { limit: 125.5, category: 'VeryUnhealthy' },
    { limit: 55.5, category: 'Unhealthy' },
    { limit: 35.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 9.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  pm10: [
    { limit: 604.1, category: 'Invalid' },
    { limit: 424.1, category: 'Hazardous' },
    { limit: 354.1, category: 'VeryUnhealthy' },
    { limit: 254.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  no2: [
    { limit: 2049.1, category: 'Invalid' },
    { limit: 1249.1, category: 'Hazardous' },
    { limit: 649.1, category: 'VeryUnhealthy' },
    { limit: 360.1, category: 'Unhealthy' },
    { limit: 100.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 53.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  o3: [
    { limit: 604.1, category: 'Invalid' },
    { limit: 504.1, category: 'Hazardous' },
    { limit: 404.1, category: 'VeryUnhealthy' },
    { limit: 204.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  co: [
    { limit: 50.5, category: 'Invalid' },
    { limit: 40.5, category: 'Hazardous' },
    { limit: 30.5, category: 'VeryUnhealthy' },
    { limit: 10.5, category: 'Unhealthy' },
    { limit: 4.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 2.5, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  so2: [
    { limit: 1004.1, category: 'Invalid' },
    { limit: 804.1, category: 'Hazardous' },
    { limit: 604.1, category: 'VeryUnhealthy' },
    { limit: 304.1, category: 'Unhealthy' },
    { limit: 185.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 75.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
};

const colors = {
  Invalid: '#C6D1DB',
  Hazardous: '#D95BA3',
  VeryUnhealthy: '#AC5CD9',
  Unhealthy: '#F7453C',
  UnhealthyForSensitiveGroups: '#FF851F',
  ModerateAir: '#FFD633',
  GoodAir: '#34C759',
  undefined: '#C6D1DB',
};

/**
 * Get AQI category based on pollutant and value
 * @param {String} pollutant
 * @param {Number} value
 * @returns {Object}
 */
export const getAQICategory = (pollutant, value) => {
  if (!markerDetails[pollutant]) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }

  const categories = markerDetails[pollutant];
  // Loop through categories assuming they are ordered from highest threshold to lowest
  for (let i = 0; i < categories.length; i++) {
    if (value >= categories[i].limit) {
      return {
        icon: categories[i].category,
        color: colors[categories[i].category] || colors.undefined,
        category: categories[i].category,
      };
    }
  }
  // Fallback in case no category matched (should not happen if thresholds are complete)
  return {
    icon: 'Invalid',
    color: colors.Invalid,
    category: 'Invalid',
  };
};

export const getAQIcon = (pollutant, value) => {
  if (!markerDetails[pollutant]) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }

  const categories = markerDetails[pollutant];
  for (let i = 0; i < categories.length; i++) {
    if (value >= categories[i].limit) {
      return categories[i].category;
    }
  }
  return 'Invalid';
};

export const getAQIMessage = (pollutant, timePeriod, value) => {
  if (!markerDetails[pollutant]) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }

  const aqiCategory = getAQICategory(pollutant, value);

  switch (aqiCategory.icon) {
    case 'GoodAir':
      return 'Enjoy the day with confidence in the clean air around you.';
    case 'ModerateAir':
      return timePeriod === 'this week'
        ? 'This week is a great time to be outdoors.'
        : `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} is a great day for an outdoor activity.`;
    case 'UnhealthyForSensitiveGroups':
      return 'Reduce the intensity of your outdoor activities.';
    case 'Unhealthy':
      return timePeriod === 'this week'
        ? 'Avoid activities that make you breathe more rapidly. This week is the perfect time to spend indoors reading.'
        : `Avoid activities that make you breathe more rapidly. ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} is the perfect time to spend indoors reading.`;
    case 'VeryUnhealthy':
      return 'Reduce the intensity of your outdoor activities. Try to stay indoors until the air quality improves.';
    case 'Hazardous':
      return 'If you have to spend a lot of time outside, disposable masks like the N95 are helpful.';
    default:
      return '';
  }
};

/**
 * Create HTML for unClustered nodes
 * @param {Object} feature
 * @param {String} NodeType
 * @param {String} selectedNode
 * @returns {String}
 */
export const UnclusteredNode = ({ feature, NodeType, selectedNode }) => {
  if (!feature?.properties?.aqi) {
    console.error('feature.properties.aqi is not defined', feature);
    return '';
  }

  // Use a fallback to the 'Invalid' icon if the desired one isn’t available
  const Icon = images[feature.properties.aqi.icon] || images['Invalid'];
  const isActive =
    selectedNode && selectedNode === feature.properties._id ? 'active' : '';

  if (NodeType === 'Number') {
    return `
      <div id="${feature.properties._id}" 
        class="unClustered-Number shadow-md ${isActive}"
        style="background-color: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 40px; height: 40px;">
        <p class="text-[#000] text-xs font-bold">${Number(feature.properties.pm2_5)?.toFixed(2) || 'N/A'}</p>
        <span class="arrow"></span>
      </div>
    `;
  }

  if (NodeType === 'Node') {
    return `
      <div id="${feature.properties._id}" 
        class="unClustered-Node shadow-md ${isActive}"
        style="background-color: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 30px; height: 30px;">
        <span class="arrow"></span> 
      </div>
    `;
  }

  return `
    <div id="${feature.properties._id}" class="unClustered shadow-md ${isActive}">
      <img src="${Icon}" alt="AQI Icon" class="w-full h-full" />
      <span class="arrow"></span>
    </div>
  `;
};

/**
 * Create HTML for Clustered nodes
 * @param {Object} params
 * @param {Object} params.feature
 * @param {String} params.NodeType
 * @returns {String}
 */
export const createClusterNode = ({ feature, NodeType }) => {
  // Validate that feature and expected properties exist
  if (!feature || !feature.properties) {
    console.error(
      'Invalid feature or feature.properties is undefined',
      feature,
    );
    return '';
  }

  // Check that feature.properties.aqi exists and is an array with at least 2 elements
  if (
    !Array.isArray(feature.properties.aqi) ||
    feature.properties.aqi.length < 2
  ) {
    console.error(
      'feature.properties.aqi is not an array with at least 2 elements',
      feature.properties.aqi,
    );
    return '';
  }

  const [firstAQI, secondAQI] = feature.properties.aqi;

  // Use default fallbacks if any expected nested data is missing
  const firstColor = colors[firstAQI?.aqi?.icon] || colors.undefined;
  const secondColor = colors[secondAQI?.aqi?.icon] || colors.undefined;
  const FirstIcon = images[firstAQI?.aqi?.icon] || images['Invalid'];
  const SecondIcon = images[secondAQI?.aqi?.icon] || images['Invalid'];

  const firstAQIValue = firstAQI.pm2_5 || firstAQI.no2 || firstAQI.pm10;
  const secondAQIValue = secondAQI.pm2_5 || secondAQI.no2 || secondAQI.pm10;

  // Ensure numeric values for display, fallback to "N/A" if missing
  const formattedFirstAQI =
    typeof firstAQIValue === 'number' ? firstAQIValue.toFixed(2) : 'N/A';
  const formattedSecondAQI =
    typeof secondAQIValue === 'number' ? secondAQIValue.toFixed(2) : 'N/A';

  const count = feature.properties.point_count || 0;
  const countDisplay = count > 2 ? `${count - 2} + ` : '';

  if (NodeType === 'Number' || NodeType === 'Node') {
    return `
      <div class="flex -space-x-3 rtl:space-x-reverse items-center justify-center">
          <div class="w-8 h-8 z-20 rounded-full flex justify-center items-center border border-gray-300 text-[8px] overflow-hidden" style="background:${firstColor}">
            ${NodeType !== 'Node' ? formattedFirstAQI : ''}
          </div>
          <div class="w-8 h-8 z-10 rounded-full flex justify-center border border-gray-300 items-center text-[8px] overflow-hidden" style="background:${secondColor}">
            ${NodeType !== 'Node' ? formattedSecondAQI : ''}
          </div>
      </div>
      <div class="text-black text-sm font-bold ml-2">${countDisplay}</div>
    `;
  }

  return `
    <div class="flex -space-x-3 rtl:space-x-reverse">
      <img class="w-8 h-8 border-2 border-white rounded-full z-20" src="${FirstIcon}" alt="AQI Icon">
      <img class="w-8 h-8 border-2 border-white rounded-full z-10" src="${SecondIcon}" alt="AQI Icon">
    </div>
    <div class="text-black text-sm font-bold ml-2" style="${countDisplay ? 'display:block' : 'display:none'}">${countDisplay}</div>
  `;
};

/**
 * Create HTML for Popup
 * @param {Object} params
 * @param {Object} params.feature
 * @param {Object} params.images
 * @returns {String}
 */
export const createPopupHTML = ({ feature, images }) => {
  if (!feature || !feature.properties) {
    console.error('Invalid feature properties');
    return '';
  }

  // Validate necessary data before proceeding
  if (typeof feature.properties.pm2_5 !== 'number' || !feature.properties.aqi) {
    console.error('Invalid AQI or PM2.5 data', feature.properties);
    return '';
  }

  const formattedDate = new Date(
    feature.properties.createdAt,
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  return `
    <div class="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-lg" style="min-width: 250px; width: max-content;">
      <div class="text-gray-500 text-xs font-normal font-sans leading-none">
        ${formattedDate}
      </div>
  
      <div class="flex justify-between gap-2 w-full items-center">
        <div class="flex items-center space-x-2">
          <div class="rounded-full bg-blue-500 w-3 h-3"></div>
          <div class="text-[#3C4555] font-semibold text-sm leading-4" style="width:25ch;">
            ${feature.properties.location || 'Unknown Location'}
          </div>
        </div>
        <div class="text-[#3C4555] font-semibold text-sm leading-4">${feature.properties.pm2_5.toFixed(2)} µg/m³</div>
      </div>
      <div class="flex justify-between gap-5 items-center w-full">
        <p class="font-semibold text-sm leading-4" style="color: ${feature.properties.aqi.color};width:30ch;">
          Air Quality is ${String(feature.properties.airQuality)
            .replace(/([A-Z])/g, ' $1')
            .trim()}
        </p>
        <img src="${images[feature.properties.aqi.icon] || images['Invalid']}" alt="AQI Icon" class="w-8 h-8">
      </div>
    </div>
  `;
};
