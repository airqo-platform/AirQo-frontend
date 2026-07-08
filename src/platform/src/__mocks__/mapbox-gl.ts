const createMapInstance = () => ({
  on: jest.fn(),
  off: jest.fn(),
  remove: jest.fn(),
  addSource: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  removeSource: jest.fn(),
  setLayoutProperty: jest.fn(),
  setPaintProperty: jest.fn(),
  getLayer: jest.fn(),
  getSource: jest.fn(),
  fitBounds: jest.fn(),
  flyTo: jest.fn(),
  jumpTo: jest.fn(),
  getCanvas: jest.fn(() => ({ style: {} })),
  getContainer: jest.fn(),
  isStyleLoaded: jest.fn(() => true),
  loaded: jest.fn(() => true),
  resize: jest.fn(),
  addControl: jest.fn(),
  loadImage: jest.fn(),
  addImage: jest.fn(),
  hasImage: jest.fn(),
});

const mapInstance = createMapInstance();

const Popup = jest.fn().mockImplementation(() => ({
  setLngLat: jest.fn().mockReturnThis(),
  setHTML: jest.fn().mockReturnThis(),
  setDOMContent: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  on: jest.fn(),
}));

const Marker = jest.fn().mockImplementation(() => ({
  setLngLat: jest.fn().mockReturnThis(),
  setPopup: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  getLngLat: jest.fn(),
}));

const NavigationControl = jest.fn();
const GeolocateControl = jest.fn();
const ScaleControl = jest.fn();
const FullscreenControl = jest.fn();

export default {
  Map: jest.fn().mockImplementation(() => createMapInstance()),
  Popup,
  Marker,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  accessToken: '',
  supported: jest.fn(() => true),
  setRTLTextPlugin: jest.fn(),
  getRTLTextPluginStatus: jest.fn(),
};

export {
  mapInstance,
  Popup,
  Marker,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
};
