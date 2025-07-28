import { markerDetails, colors, images } from '../constants/mapConstants';

import { parseISO, format } from 'date-fns';

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

  // Generate unique key based on all relevant properties to prevent caching issues
  const nodeKey = `${feature.properties._id}-${NodeType}-${isDarkMode}-${isActive}`;

  if (NodeType === 'Number') {
    return `
      <div id="${feature.properties._id}" 
        key="${nodeKey}"
        class="unClustered-Number shadow-md rounded-full ${isActive}${darkClass}"
        style="background: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 40px; height: 40px; z-index: 1;">
        <p class="text-[#000] text-xs font-bold">${Number(feature.properties.pm2_5)?.toFixed(2) || 'N/A'}</p>
        <span class="arrow"></span>
      </div>
    `;
  }

  if (NodeType === 'Node') {
    return `
      <div id="${feature.properties._id}" 
        key="${nodeKey}"
        class="unClustered-Node shadow-md rounded-full ${isActive}${darkClass}"
        style="background: ${feature.properties.aqi.color}; color: ${feature.properties.aqi.color}; width: 30px; height: 30px; z-index: 1;">
        <span class="arrow"></span> 
      </div>
    `;
  }

  return `
    <div id="${feature.properties._id}" 
      key="${nodeKey}"
      class="unClustered shadow-md ${isActive}${darkClass}"
      style="z-index: 1;">
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

  // Generate unique key to prevent caching issues
  const clusterKey = `${feature.properties.cluster_id}-${NodeType}-${isDarkMode}`;

  if (NodeType === 'Number' || NodeType === 'Node') {
    return `
      <div key="${clusterKey}" class="flex -space-x-3 rtl:space-x-reverse items-center justify-center${darkClass}" style="z-index: 1;">
          <div class="w-8 h-8 rounded-full flex justify-center items-center border border-gray-300 text-[8px] overflow-hidden" style="background:${firstColor}; z-index: 1;">
            ${NodeType !== 'Node' ? formattedFirstAQI : ''}
          </div>
          <div class="w-8 h-8 rounded-full flex justify-center border border-gray-300 items-center text-[8px] overflow-hidden" style="background:${secondColor}; z-index: 1;">
            ${NodeType !== 'Node' ? formattedSecondAQI : ''}
          </div>
      </div>
      <div class="text-black text-sm font-bold ml-2" style="z-index: 1;">${countDisplay}</div>
    `;
  }

  return `
    <div key="${clusterKey}" class="flex -space-x-3 rtl:space-x-reverse" style="z-index: 1;">
      <img class="w-8 h-8 border-2 border-white rounded-full" src="${FirstIcon}" alt="AQI Icon" style="z-index: 1;">
      <img class="w-8 h-8 border-2 border-white rounded-full" src="${SecondIcon}" alt="AQI Icon" style="z-index: 1;">
    </div>
    <div class="text-black text-sm font-bold ml-2" style="${countDisplay ? 'display:block' : 'display:none'}; z-index: 1;">${countDisplay}</div>
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

  // Support both pm2_5 and pm10, and show which is being displayed
  const {
    pm2_5,
    pm10,
    aqi,
    location = 'Unknown Location',
    time,
  } = feature.properties;
  let pollutantType = 'pm2.5';
  let value = pm2_5;
  if (typeof pm10 === 'number' && (!pm2_5 || isNaN(pm2_5))) {
    pollutantType = 'pm10';
    value = pm10;
  }

  if (typeof value !== 'number' || !aqi || typeof time !== 'string') {
    console.error(
      'Missing or invalid value, AQI or timestamp',
      feature.properties,
    );
    return '';
  }

  // Parse + format date
  let parsedDate = parseISO(time);
  if (isNaN(parsedDate)) {
    console.error('Invalid date string', time);
    return '';
  }
  const formattedDate = format(parsedDate, 'MMMM dd, yyyy');

  // Card design improvements
  const popupBgColor = isDarkMode ? '#23272f' : '#f9fafb';
  const popupTextColor = isDarkMode ? '#fff' : '#1e293b';
  const borderColor = isDarkMode ? '#334155' : '#e5e7eb';

  // Show which pollutant is being displayed
  const pollutantLabel = pollutantType === 'pm2.5' ? 'PM2.5' : 'PM10';
  const pollutantUnit = pollutantType === 'pm2.5' ? 'µg/m³' : 'µg/m³';

  return `
    <div
      class="flex flex-col p-4 rounded-lg shadow-lg border"
      style="
        min-width: 260px;
        max-width: 350px;
        width: 100%;
        background: ${popupBgColor};
        color: ${popupTextColor};
        border: 1px solid ${borderColor};
        box-sizing: border-box;
      "
    >
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-medium opacity-70">Last updated: ${formattedDate}</span>
        <img
          src="${images[aqi.icon] || images['Invalid']}"
          alt="AQI Icon"
          class="w-8 h-8 ml-2"
        />
      </div>
      <div class="flex items-center gap-2 mb-2">
        <div class="rounded-full w-3 h-3" style="background: var(--org-primary, var(--color-primary, #145fff));"></div>
        <span class="font-bold text-base" style="color: ${popupTextColor}; line-height:1.2;">${location}</span>
      </div>
      <div class="flex flex-row items-center gap-2 mb-2">
        <span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">${pollutantLabel}</span>
        <span class="font-bold text-2xl" style="color: ${popupTextColor}; line-height: 1.1;">
          ${value.toFixed(2)}
        </span>
        <span class="text-xs font-normal">${pollutantUnit}</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold text-base" style="color: ${aqi.color};">${String(
          feature.properties.airQuality,
        )
          .replace(/([A-Z])/g, ' $1')
          .trim()}</span>
      </div>
    </div>
  `;
};
