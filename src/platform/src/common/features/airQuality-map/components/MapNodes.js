import { renderToString } from 'react-dom/server';

// Import icon components
import GoodAir from '@/icons/Charts/GoodAir';
import ModerateAir from '@/icons/Charts/Moderate';
import UnhealthyForSensitiveGroups from '@/icons/Charts/UnhealthySG';
import Unhealthy from '@/icons/Charts/Unhealthy';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import Hazardous from '@/icons/Charts/Hazardous';
import Invalid from '@/icons/Charts/Invalid';

import { parseISO, format } from 'date-fns';

// -------------------------------------------------------------------
// Icon Images: Encoded SVG images for use in markers/popups
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// Marker thresholds and colors based on pollutant type
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// Get the AQI category for a pollutant value.
// -------------------------------------------------------------------
export const getAQICategory = (pollutant, value) => {
  if (!markerDetails[pollutant]) {
    throw new Error(`Invalid pollutant: ${pollutant}`);
  }
  const categories = markerDetails[pollutant];
  for (let i = 0; i < categories.length; i++) {
    if (value >= categories[i].limit) {
      return {
        icon: categories[i].category,
        color: colors[categories[i].category] || colors.undefined,
        category: categories[i].category,
      };
    }
  }
  // Fallback – ideally should not happen if thresholds are complete
  return {
    icon: 'Invalid',
    color: colors.Invalid,
    category: 'Invalid',
  };
};

// -------------------------------------------------------------------
// Get the AQI icon (category name) for a pollutant value.
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// Get a descriptive AQI message based on pollutant value and time period.
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// Create HTML for unclustered nodes.
// Accepts an optional `isDarkMode` flag to adjust styling.
// -------------------------------------------------------------------
export const UnclusteredNode = ({
  feature,
  NodeType,
  selectedNode,
  isDarkMode = false,
}) => {
  if (!feature?.properties?.aqi) {
    console.error('feature.properties.aqi is not defined', feature);
    return '';
  }
  // Fallback to 'Invalid' icon if needed
  const Icon = images[feature.properties.aqi.icon] || images['Invalid'];
  const isActive =
    selectedNode && selectedNode === feature.properties._id ? 'active' : '';
  const darkClass = isDarkMode ? ' dark-marker' : '';
  if (NodeType === 'Number') {
    return `
      <div id="${feature.properties._id}" 
        class="unClustered-Number shadow-md rounded-full ${isActive}${darkClass}"
        style="background: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 40px; height: 40px;">
        <p class="text-[#000] text-xs font-bold">${Number(feature.properties.pm2_5)?.toFixed(2) || 'N/A'}</p>
        <span class="arrow"></span>
      </div>
    `;
  }
  if (NodeType === 'Node') {
    return `
      <div id="${feature.properties._id}" 
        class="unClustered-Node shadow-md rounded-full ${isActive}${darkClass}"
        style="background: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 30px; height: 30px;">
        <span class="arrow"></span> 
      </div>
    `;
  }
  return `
    <div id="${feature.properties._id}" class="unClustered shadow-md ${isActive}${darkClass}">
      <img src="${Icon}" alt="AQI Icon" class="w-full h-full" />
      <span class="arrow"></span>
    </div>
  `;
};

// -------------------------------------------------------------------
// Create HTML for clustered nodes.
// Accepts an optional `isDarkMode` flag to adjust styling.
// -------------------------------------------------------------------
export const createClusterNode = ({
  feature,
  NodeType,
  isDarkMode = false,
}) => {
  if (!feature || !feature.properties) {
    console.error(
      'Invalid feature or feature.properties is undefined',
      feature,
    );
    return '';
  }
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
  const firstColor = colors[firstAQI?.aqi?.icon] || colors.undefined;
  const secondColor = colors[secondAQI?.aqi?.icon] || colors.undefined;
  const FirstIcon = images[firstAQI?.aqi?.icon] || images['Invalid'];
  const SecondIcon = images[secondAQI?.aqi?.icon] || images['Invalid'];
  const firstAQIValue = firstAQI.pm2_5 || firstAQI.no2 || firstAQI.pm10;
  const secondAQIValue = secondAQI.pm2_5 || secondAQI.no2 || secondAQI.pm10;
  const formattedFirstAQI =
    typeof firstAQIValue === 'number' ? firstAQIValue.toFixed(2) : 'N/A';
  const formattedSecondAQI =
    typeof secondAQIValue === 'number' ? secondAQIValue.toFixed(2) : 'N/A';
  const count = feature.properties.point_count || 0;
  const countDisplay = count > 2 ? `${count - 2} + ` : '';
  const darkClass = isDarkMode ? ' dark-marker' : '';

  if (NodeType === 'Number' || NodeType === 'Node') {
    return `
      <div class="flex -space-x-3 rtl:space-x-reverse items-center justify-center${darkClass}">
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

// -------------------------------------------------------------------
// Create HTML for the popup.
// Accepts an optional `isDarkMode` flag to adjust popup styling.
// -------------------------------------------------------------------
export const createPopupHTML = ({ feature, images, isDarkMode = false }) => {
  // 1) Basic validations
  if (!feature || !feature.properties) {
    console.error('Invalid feature object', feature);
    return '';
  }

  const {
    pm2_5,
    aqi,
    location = 'Unknown Location',
    time,
  } = feature.properties;

  if (typeof pm2_5 !== 'number' || !aqi || typeof time !== 'string') {
    console.error(
      'Missing or invalid PM2.5, AQI or timestamp',
      feature.properties,
    );
    return '';
  }

  // 2) Parse + format date with date‑fns
  let parsedDate = parseISO(time);
  if (isNaN(parsedDate)) {
    console.error('Invalid date string', time);
    return '';
  }
  const formattedDate = format(parsedDate, 'MMMM dd, yyyy'); // e.g. "April 18, 2025"

  // 3) Choose dark/light colors
  const popupBgColor = isDarkMode ? '#333' : '#fff';
  const popupTextColor = isDarkMode ? '#fff' : '#3C4555';

  // 4) Return HTML string
  return `
    <div
      class="flex flex-col gap-2 p-3 rounded-lg shadow-lg"
      style="
        min-width: 250px;
        width: max-content;
        background-color: ${popupBgColor};
      "
    >
      <div
        class="text-gray-500 text-xs font-normal font-sans leading-none"
        style="color: ${popupTextColor};"
      >
        ${formattedDate}
      </div>

      <div class="flex justify-between gap-2 w-full items-center">
        <div class="flex items-center space-x-2">
          <div class="rounded-full bg-blue-500 w-3 h-3"></div>
          <div
            class="font-semibold text-sm leading-4"
            style="width:25ch; color: ${popupTextColor};"
          >
            ${location}
          </div>
        </div>
        <div
          class="font-semibold text-sm leading-4"
          style="color: ${popupTextColor};"
        >
          ${pm2_5.toFixed(2)} µg/m³
        </div>
      </div>

      <div class="flex justify-between gap-5 items-center w-full">
        <p
          class="font-semibold text-sm leading-4"
          style="color: ${aqi.color}; width:30ch;"
        >
          Air Quality is
          ${String(feature.properties.airQuality)
            .replace(/([A-Z])/g, ' $1')
            .trim()}
        </p>
        <img
          src="${images[aqi.icon] || images['Invalid']}"
          alt="AQI Icon"
          class="w-8 h-8"
        />
      </div>
    </div>
  `;
};
