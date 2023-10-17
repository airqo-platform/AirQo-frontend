import React from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import AirqloudUptimeChart from 'views/components/DataDisplay/DeviceManagement/AirqloudUptimeChart';
import { renderWithProviders } from '../test_utils';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn()
}));

test('renders AirqloudUptimeChart component', () => {
  const mockDispatch = jest.fn();
  useDispatch.mockReturnValue(mockDispatch);

  jest.spyOn(Date, 'now').mockImplementation(() => new Date('2020-01-01T00:00:00.000Z').getTime());

  // Render the component
  renderWithProviders(<AirqloudUptimeChart />);
});
