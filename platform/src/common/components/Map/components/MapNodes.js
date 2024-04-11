import { renderToString } from 'react-dom/server';

import GoodAir from '@/icons/Charts/GoodAir';
import ModerateAir from '@/icons/Charts/Moderate';
import UnhealthyForSensitiveGroups from '@/icons/Charts/UnhealthySG';
import Unhealthy from '@/icons/Charts/Unhealthy';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import Hazardous from '@/icons/Charts/Hazardous';

// icon images
export const images = {
  GoodAir: `data:image/svg+xml,${encodeURIComponent(renderToString(<GoodAir />))}`,
  ModerateAir: `data:image/svg+xml,${encodeURIComponent(renderToString(<ModerateAir />))}`,
  UnhealthyForSensitiveGroups: `data:image/svg+xml,${encodeURIComponent(
    renderToString(<UnhealthyForSensitiveGroups />),
  )}`,
  Unhealthy: `data:image/svg+xml,${encodeURIComponent(renderToString(<Unhealthy />))}`,
  VeryUnhealthy: `data:image/svg+xml,${encodeURIComponent(renderToString(<VeryUnhealthy />))}`,
  Hazardous: `data:image/svg+xml,${encodeURIComponent(renderToString(<Hazardous />))}`,
  Invalid: '/images/map/Invalid.png',
};

const markerDetails = {
  pm2_5: [
    { limit: 500.5, category: 'Invalid' },
    { limit: 250.5, category: 'Hazardous' },
    { limit: 150.5, category: 'VeryUnhealthy' },
    { limit: 55.5, category: 'Unhealthy' },
    { limit: 35.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 12.1, category: 'ModerateAir' },
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
};

const colors = {
  Invalid: '#C6D1DB',
  Hazardous: '#D95BA3',
  VeryUnhealthy: '#AC5CD9',
  Unhealthy: '#F7453C',
  UnhealthyForSensitiveGroups: '#FF851F',
  ModerateAir: '#FFD633',
  GoodAir: '#34C759',
};

const messages = {
  GoodAir: 'Enjoy the day with confidence in the clean air around you.',
  ModerateAir: 'Today is a great day for an outdoor activity.',
  UnhealthyForSensitiveGroups: 'Reduce the intensity of your outdoor activities.',
  Unhealthy:
    'Avoid activities that make you breathe more rapidly. Today is the perfect day to spend indoors reading.',
  VeryUnhealthy:
    'Reduce the intensity of your outdoor activities. Try to stay indoors until the air quality improves.',
  Hazardous:
    'If you have to spend a lot of time outside, disposable masks like the N95 are helpful.',
};

/**
 * Get random key from object
 * @param {Object} obj
 * @returns {String}
 */
const getRandomKey = (obj) => {
  const keys = Object.keys(obj);
  let key = keys[Math.floor(Math.random() * keys.length)];
  return key;
};

/**
 * Get AQI category based on pollutant and value
 * @param {String} pollutant
 * @param {Number} value
 * @returns {Object}
 */
export const getAQICategory = (pollutant, value) => {
  if (!markerDetails.hasOwnProperty(pollutant)) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }

  const categories = markerDetails[pollutant];
  for (let i = 0; i < categories.length; i++) {
    if (value >= categories[i].limit) {
      return { icon: categories[i].category, color: colors[categories[i].category] };
    }
  }
};

export const getAQIcon = (pollutant, value) => {
  if (!markerDetails.hasOwnProperty(pollutant)) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }

  const categories = markerDetails[pollutant];
  for (let i = 0; i < categories.length; i++) {
    if (value >= categories[i].limit) {
      return categories[i].category;
    }
  }
};

export const getAQIMessage = (pollutant, value) => {
  if (!markerDetails.hasOwnProperty(pollutant)) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }

  const aqiCategory = getAQICategory(pollutant, value);

  return messages[aqiCategory?.icon] || '';
};

/**
 * Create HTML for unClustered nodes
 * @param {Object} feature
 * @param {String} NodeType
 * @returns {String}
 */
export const UnclusteredNode = ({ feature, NodeType, selectedNode }) => {
  // Check if feature.properties.aqi is defined
  if (feature.properties && feature.properties.aqi) {
    const Icon = images[feature.properties.aqi.icon];
    const isActive = selectedNode && selectedNode === feature.properties._id ? 'active' : '';

    if (NodeType === 'Number') {
      return `
      <div id="${feature.properties._id}" class="unClustered-Number shadow-md ${isActive}"
          style="background-color: ${feature.properties.aqi.color}; color: ${
        feature.properties.aqi.color
      }; width: 40px; height: 40px;"
        >
        <p class="text-[#000] text-xs font-bold">${feature.properties.pm2_5.toFixed(2)}</p>
        <span class="arrow"></span>
      </div>
      `;
    }

    if (NodeType === 'Node') {
      return `
      <div id="${feature.properties._id}" class="unClustered-Node shadow-md ${isActive}"
        style="background-color: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 30px; height: 30px;"
      >
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
  } else {
    // Handle the case where feature.properties.aqi is not defined
    console.error('feature.properties.aqi is not defined for feature: ', feature);
    return '';
  }
};

/**
 * Create HTML for Clustered nodes
 * @param {Object} feature
 * @param {String} NodeType
 * @returns {String}
 */
export const createClusterNode = ({ feature, NodeType }) => {
  // Randomly select two different colors
  let firstColorKey, secondColorKey;
  do {
    firstColorKey = getRandomKey(colors);
    secondColorKey = getRandomKey(colors);
  } while (firstColorKey === secondColorKey);

  // Randomly select two different images
  let firstImageKey, secondImageKey;
  do {
    firstImageKey = getRandomKey(images);
    secondImageKey = getRandomKey(images);
  } while (firstImageKey === secondImageKey);

  const FirstIcon = images[firstImageKey];
  const SecondIcon = images[secondImageKey];

  const count = feature.properties.point_count_abbreviated;
  const countDisplay = count > 2 ? `${count - 2} + ` : '';

  if (NodeType === 'Number' || NodeType === 'Node') {
    return `
      <div class="flex -space-x-3 rtl:space-x-reverse items-center justify-center">
          <div class="w-8 h-8 z-20 rounded-full border-white flex justify-center items-center text-[8px] overflow-hidden" style="background:${
            colors[firstColorKey]
          }">${NodeType !== 'Node' ? '12.02' : ''}</div>
          <div class="w-8 h-8 z-10 rounded-full border-white flex justify-center items-center text-[8px] overflow-hidden" style="background:${
            colors[secondColorKey]
          }">${NodeType !== 'Node' ? '112.23' : ''}</div>
      </div>

      <div class="text-black text-sm font-bold ml-2">${countDisplay}</div>
    `;
  }

  return `
    <div class="flex -space-x-3 rtl:space-x-reverse">
      <img class="w-8 h-8 border-2 border-white rounded-full z-20" src="${FirstIcon}" alt="AQI Icon">
      <img class="w-8 h-8 border-2 border-white rounded-full z-10" src="${SecondIcon}" alt="AQI Icon">
    </div>
    <div class="text-black text-sm font-bold ml-2" style="${
      countDisplay ? 'block' : 'none'
    }">${countDisplay}</div>
  `;
};

/**
 * Create HTML for Popup
 * @param {Object} feature
 * @param {Object} images
 * @returns {String}
 */
export const createPopupHTML = ({ feature, images }) => {
  if (!feature || !feature.properties) {
    console.error('Invalid feature properties');
    return '';
  }

  return `
    <div class="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-lg" style="min-width: 250px; width: max-content;">
      <div class="text-gray-500 text-xs font-normal font-sans leading-none">
        ${new Date(feature.properties.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        })}
      </div>
  
      <div class="flex justify-between gap-2 w-full items-center">
        <div class="flex items-center space-x-2">
          <div class="rounded-full bg-blue-500 w-3 h-3"></div>
          <div class="text-[#3C4555] font-semibold text-sm leading-4" style="width:25ch;">
          ${feature.properties.location}
          </div>
        </div>
        <div class="text-[#3C4555] font-semibold text-sm leading-4">${feature.properties.pm2_5.toFixed(
          2,
        )} µg/m³</div>
      </div>
      <div class="flex justify-between gap-5 items-center w-full">
        <p class="font-semibold text-sm leading-4" style="color: ${
          feature.properties.aqi.color
        };width:30ch;">
          Air Quality is ${feature.properties.airQuality}
        </p>
        <img src="${images[feature.properties.aqi.icon]}" alt="AQI Icon" class="w-8 h-8">
      </div>
    </div>
  `;
};
