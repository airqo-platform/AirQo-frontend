import Node from '@/images/map/Node.webp';
import Emoji from '@/images/map/Emoji.webp';
import Heatmap from '@/images/map/Heatmap.webp';
import Node_Number from '@/images/map/Node_number.webp';

import DarkMode from '@/images/map/dark.webp';
import LightMode from '@/images/map/light.webp';
import SatelliteMode from '@/images/map/satellite.webp';
import StreetsMode from '@/images/map/street.webp';

import { renderToString } from 'react-dom/server';

// Import icon components
import {
  AqGood,
  AqModerate,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
  AqUnhealthy,
  AqHazardous,
  AqNoValue,
} from '@airqo/icons-react';

export const BOUNDARY_URL = 'https://nominatim.openstreetmap.org/search';

export const mapStyles = [
  {
    url: 'mapbox://styles/mapbox/streets-v12',
    name: 'Streets',
    image: StreetsMode,
  },
  {
    url: 'mapbox://styles/mapbox/light-v11',
    name: 'Light',
    image: LightMode,
  },
  {
    url: 'mapbox://styles/mapbox/dark-v11',
    name: 'Dark',
    image: DarkMode,
  },
  {
    url: 'mapbox://styles/mapbox/satellite-v9',
    name: 'Satellite',
    image: SatelliteMode,
  },
];

export const mapDetails = [
  {
    name: 'Emoji',
    image: Emoji,
  },
  {
    name: 'Heatmap',
    image: Heatmap,
  },
  {
    name: 'Node',
    image: Node,
  },
  {
    name: 'Number',
    image: Node_Number,
  },
];

export const MAP_CONFIG = {
  PROJECTION: 'mercator',
  PERFORMANCE: {
    ANTIALIAS: false,
    OPTIMIZE_FOR_TERRAIN: false,
    RENDER_WORLD_COPIES: false,
    REFRESH_EXPIRED_TILES: false,
    MAX_TILE_CACHE_SIZE: 50,
  },
  TIMEOUTS: {
    DATA_FETCH_DELAY: 100,
    CONTROL_CHECK_INTERVAL: 2000,
    ZOOM_DEBOUNCE: 100,
    STYLE_LOAD_FALLBACK: 500,
    IDLE_CALLBACK_TIMEOUT: 1000,
  },
  BREAKPOINTS: {
    DESKTOP_MIN_WIDTH: 1024,
  },
};

export const TOAST_CONFIG = {
  TIMEOUT: 3000,
  POSITION: 'bottom',
};

export const LAYOUT_CONFIG = {
  MOBILE: {
    MAP_HEIGHT: '40%',
    SIDEBAR_HEIGHT: '60%',
  },
  DESKTOP: {
    SIDEBAR_MIN_WIDTH: '380px',
    SIDEBAR_LG_WIDTH: '470px',
  },
};

// -------------------------------------------------------------------
// Icon Images: Encoded SVG images for use in markers/popups
// -------------------------------------------------------------------
export const images = {
  GoodAir: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqGood />))}`,
  ModerateAir: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqModerate />))}`,
  UnhealthyForSensitiveGroups: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqUnhealthyForSensitiveGroups />))}`,
  Unhealthy: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqUnhealthy />))}`,
  VeryUnhealthy: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqVeryUnhealthy />))}`,
  Hazardous: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqHazardous />))}`,
  Invalid: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqNoValue />))}`,
  undefined: `data:image/svg+xml,${encodeURIComponent(renderToString(<AqNoValue />))}`,
};

// -------------------------------------------------------------------
// Marker thresholds and colors based on pollutant type
// -------------------------------------------------------------------
export const markerDetails = {
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

export const colors = {
  Invalid: '#C6D1DB',
  Hazardous: '#D95BA3',
  VeryUnhealthy: '#AC5CD9',
  Unhealthy: '#F7453C',
  UnhealthyForSensitiveGroups: '#FF851F',
  ModerateAir: '#FFD633',
  GoodAir: '#34C759',
  undefined: '#C6D1DB',
};
