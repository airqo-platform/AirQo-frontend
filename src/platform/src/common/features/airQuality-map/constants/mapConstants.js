import Node from '@/images/map/Node.webp';
import Emoji from '@/images/map/Emoji.webp';
import Heatmap from '@/images/map/Heatmap.webp';
import Node_Number from '@/images/map/Node_number.webp';

import DarkMode from '@/images/map/dark.webp';
import LightMode from '@/images/map/light.webp';
import SatelliteMode from '@/images/map/satellite.webp';
import StreetsMode from '@/images/map/street.webp';

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
