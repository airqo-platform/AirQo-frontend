import React from 'react';
import { render } from '@testing-library/react';
import LocationTracker from '../../components/LoctionTracker/LocationTracker';

// Mock redux store data
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn()
}));

global.navigator.geolocation = {
  getCurrentPosition: jest.fn((success) => success({ coords: { latitude: 0, longitude: 0 } }))
};

describe('LocationTracker', () => {
  it('renders without crashing', () => {
    render(
      <LocationTracker countries={[{ name: 'Uganda' }, { name: 'Kenya' }, { name: 'Tanzania' }]} />
    );
  });
});
