import React from 'react';
import { useDispatch } from 'react-redux';
import * as moment from 'moment';
import AirqloudUptimeChart from 'views/components/DataDisplay/DeviceManagement/AirqloudUptimeChart';
import { renderWithProviders } from '../test_utils';
import { roundToStartOfDay, roundToEndOfDay } from 'utils/dateTime';
import { fetchDashboardAirQloudsData } from 'redux/AirQloud/operations';
import { loadAirqloudUptime } from 'redux/DeviceManagement/operations';

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-01-01T00:00:00.000Z');
});

jest.mock('moment-timezone', () => {
  return () => jest.requireActual('moment-timezone')('2020-01-01T00:00:00.000Z');
});

jest.mock('moment', () => ({
  utc: {
    format: jest.fn(() => '2020-01-01T00:00:00.000Z')
  }
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn()
}));

jest.mock('../../redux/DeviceManagement/selectors', () => ({
  useAirqloudUptimeData: jest.fn(() => ({ airqloudUptime: [] }))
}));

jest.mock('../../redux/AirQloud/selectors', () => ({
  useDashboardAirqloudsData: jest.fn(() => ({ dashboardAirQlouds: {} })),
  useCurrentAirQloudData: jest.fn(() => ({ currentAirQloud: {} }))
}));

test('renders AirqloudUptimeChart component', () => {
  const mockDispatch = jest.fn();
  useDispatch.mockReturnValue(mockDispatch);
  // Render the component
  const { getByText, getByLabelText } = renderWithProviders(<AirqloudUptimeChart />);

  expect(mockDispatch).toHaveBeenCalledWith(fetchDashboardAirQloudsData());
  expect(mockDispatch).toHaveBeenCalledWith(
    loadAirqloudUptime({
      startDateTime: roundToStartOfDay(
        moment(new Date()).subtract(1, 'days').toISOString()
      ).toISOString(),
      endDateTime: roundToEndOfDay(new Date().toISOString()).toISOString(),
      airqloud: '61363c2c7e130a001e03949f'
    })
  );

  // Assert that certain elements are present in the rendered output
  const titleElement = getByText(/Health status/i);
  const startDateInput = getByLabelText(/Start date/i);
  const endDateInput = getByLabelText(/End date/i);
  const airqloudSelect = getByLabelText(/Choose airqloud/i);
  const resetButton = getByText(/Reset chart/i);

  // // Assert that the elements are present
  expect(titleElement).toBeInTheDocument();
  expect(startDateInput).toBeInTheDocument();
  expect(endDateInput).toBeInTheDocument();
  expect(airqloudSelect).toBeInTheDocument();
  expect(resetButton).toBeInTheDocument();
});
