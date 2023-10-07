import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HeatMapOverlay from '../../views/pages/Heatmap/HeatMapOverlay';

// Mock the specific actions
jest.mock('../../redux/MapData/operations', () => ({
  loadPM25HeatMapData: jest.fn().mockReturnValue(() => Promise.resolve())
}));

jest.mock('../../redux/MapData/operations', () => ({
  loadMapEventsData: jest.fn().mockReturnValue(() => Promise.resolve())
}));

const mockStore = configureStore([thunk]);

describe('HeatMapOverlay', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      heatMapData: {
        heatMapData: {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.123, 49.123]
              },
              properties: {
                id: 1,
                name: 'test',
                value: 1
              }
            }
          ]
        },
        loading: false,
        error: null
      },
      monitoringSiteData: {
        monitoringSiteData: {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.123, 49.123]
              },
              properties: {
                id: 1,
                name: 'test',
                value: 1
              }
            }
          ]
        },
        loading: false,
        error: null
      }
    });
  });

  it('renders correctly without crashing', async () => {
    render(
      <Provider store={store}>
        <Router>
          <HeatMapOverlay />
        </Router>
      </Provider>
    );
  });

  it('renders correctly with loading', async () => {
    store = mockStore({
      heatMapData: {
        heatMapData: {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.123, 49.123]
              },
              properties: {
                id: 1,
                name: 'test',
                value: 1
              }
            }
          ]
        },
        loading: true,
        error: null
      },
      monitoringSiteData: {
        monitoringSiteData: {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.123, 49.123]
              },
              properties: {
                id: 1,
                name: 'test',
                value: 1
              }
            }
          ]
        },
        loading: false,
        error: null
      }
    });
    render(
      <Provider store={store}>
        <Router>
          <HeatMapOverlay />
        </Router>
      </Provider>
    );
  });

  it('renders correctly with error', async () => {
    store = mockStore({
      heatMapData: {
        heatMapData: {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.123, 49.123]
              },
              properties: {
                id: 1,
                name: 'test',
                value: 1
              }
            }
          ]
        },
        loading: false,
        error: 'error'
      },
      monitoringSiteData: {
        monitoringSiteData: {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.123, 49.123]
              },
              properties: {
                id: 1,
                name: 'test',
                value: 1
              }
            }
          ]
        },
        loading: false,
        error: null
      }
    });
    render(
      <Provider store={store}>
        <Router>
          <HeatMapOverlay />
        </Router>
      </Provider>
    );
  });

  it('renders correctly with no data', async () => {
    store = mockStore({
      heatMapData: {
        heatMapData: {
          features: []
        },
        loading: false,
        error: null
      },
      monitoringSiteData: {
        monitoringSiteData: {
          features: []
        },
        loading: false,
        error: null
      }
    });
    render(
      <Provider store={store}>
        <Router>
          <HeatMapOverlay />
        </Router>
      </Provider>
    );
  });
});
