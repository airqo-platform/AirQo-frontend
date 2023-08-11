import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeviceHosts from '../../views/components/DataDisplay/DeviceView/DeviceHosts';
import { getAllDeviceHosts } from '../../views/apis/deviceRegistry';

jest.mock('../../views/apis/deviceRegistry', () => ({
  getAllDeviceHosts: jest.fn(() => Promise.resolve({ hosts: [] }))
}));

describe('DeviceHosts Component', () => {
  test('renders the component', async () => {
    render(<DeviceHosts deviceData={{ site: { _id: 'site_id' } }} />);

    expect(getAllDeviceHosts).toHaveBeenCalled();

    expect(screen.getByText('Add Host')).toBeTruthy();
  });

  test('opens and closes the Add Host Dialog', async () => {
    render(<DeviceHosts deviceData={{ site: { _id: 'site_id' } }} />);

    fireEvent.click(screen.getByText('Add Host'));

    expect(screen.getByText('Add a new host')).toBeTruthy();

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByText('Add a new host')).not.toBeTruthy());
  });
});
