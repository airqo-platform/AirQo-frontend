import React from 'react';
import { render, screen } from '@testing-library/react';
import GridsDashboardView from '../../views/pages/Analytics/components/GridsDashboard';

test('renders GridsDashboardView component', () => {
  render(<GridsDashboardView grid={{}} gridDetails={{}} />);
});

test('averages chart displays data when data is passed into it', () => {
  const grid = {
    _id: '5678',
    grid_tags: [],
    grid_codes: ['3457', 'gulu_city'],
    name: 'gulu_city',
    admin_level: 'city',
    shape: {
      type: 'Polygon'
    },
    network: 'airqo',
    centers: [
      {
        longitude: 32.32499670708185,
        latitude: 2.844205541077429
      }
    ],
    long_name: 'Gulu City',
    sites: [
      {
        _id: '4560',
        name: 'Gulu Main Market',
        data_provider: 'AirQo'
      },
      {
        _id: '1123',
        name: 'Lapeta Health Centre 3',
        data_provider: 'AirQo'
      },
      {
        _id: '9080',
        name: 'Mary Queen of Peace P/s Gulu',
        data_provider: 'AirQo'
      },
      {
        _id: '647896dcc87a97001e1077b0',
        name: 'Gulu university',
        data_provider: 'AirQo'
      },
      {
        _id: '2020',
        name: 'Kasubi Central Gulu',
        data_provider: 'AirQo'
      },
      {
        _id: '9801',
        name: 'Pece Gulu',
        data_provider: 'AirQo'
      },
      {
        _id: '4444',
        name: 'Layibi Gulu',
        data_provider: 'AirQo'
      }
    ],
    numberOfSites: 7
  };

  render(<GridsDashboardView grid={grid} gridDetails={grid} />);

  // Assert that the averages chart is rendered
  expect(screen.getByText('Gulu university')).toBeInTheDocument();
  expect(screen.getByText('city')).toBeInTheDocument();
  expect(screen.getByText('7')).toBeInTheDocument();
});
