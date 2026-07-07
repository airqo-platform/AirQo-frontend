const mapboxgl = {
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    loadImage: jest.fn(),
    addImage: jest.fn(),
    fitBounds: jest.fn(),
    flyTo: jest.fn(),
    resize: jest.fn(),
    getCanvas: jest.fn().mockReturnValue({ style: {} }),
    remove: jest.fn(),
    getBounds: jest.fn().mockReturnValue({
      getNorthEast: jest.fn().mockReturnValue({ lng: 0, lat: 0 }),
      getSouthWest: jest.fn().mockReturnValue({ lng: 0, lat: 0 }),
    }),
  })),
  Popup: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setHTML: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    isOpen: jest.fn().mockReturnValue(false),
  })),
  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setPopup: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    getElement: jest.fn().mockReturnValue(document.createElement('div')),
  })),
  NavigationControl: jest.fn().mockImplementation(() => ({})),
  GeolocateControl: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
  LngLatBounds: jest.fn().mockImplementation(() => ({
    extend: jest.fn().mockReturnThis(),
    isEmpty: jest.fn().mockReturnValue(true),
  })),
};

module.exports = mapboxgl;
