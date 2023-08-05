import React from 'react';
import { render } from '@testing-library/react';
import UserCountry from '../Geolocate';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

describe('UserCountry', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      airQlouds: {
        currentAirQloudData: null
      }
    });
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <UserCountry
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
