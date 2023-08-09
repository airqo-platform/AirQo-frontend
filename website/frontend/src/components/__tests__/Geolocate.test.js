import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import Geolocate from '../Geolocate';

// Create a custom mock store
const mockStore = (state) => ({
  getState: () => state,
  subscribe: () => {},
  dispatch: () => {}
});

describe('Geolocate', () => {
  it('renders without crashing', () => {
    const initialState = {
      airQlouds: {
        currentAirQloudData: null
      }
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <Geolocate
          countries={[
            {
              name: 'Uganda'
            }
          ]}
        />
      </Provider>
    );
  });
});
