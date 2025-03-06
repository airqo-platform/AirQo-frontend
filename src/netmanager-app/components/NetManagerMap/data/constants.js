import Node from '@/public/images/map/Node.webp';
import Emoji from '@/public/images/map/Emoji.webp';
import Heatmap from '@/public/images/map/Heatmap.webp';
import Node_Number from '@/public/images/map/Node_number.webp';

import DarkMode from '@/public/images/map/dark.webp';
import LightMode from '@/public/images/map/light.webp';
import SatelliteMode from '@/public/images/map/satellite.webp';
import StreetsMode from '@/public/images/map/street.webp';

export const BOUNDARY_URL = 'https://nominatim.openstreetmap.org/search';

export const mapStyles = [
  {
    url: 'mapbox://styles/mapbox/streets-v11',
    name: 'Streets',
    image: StreetsMode,
  },
  { url: 'mapbox://styles/mapbox/light-v10', name: 'Light', image: LightMode },
  { url: 'mapbox://styles/mapbox/dark-v10', name: 'Dark', image: DarkMode },
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


