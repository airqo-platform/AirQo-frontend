import React from 'react';
import { render, screen } from '@testing-library/react';
import DeviceStatusCard from '../../../components/DeviceStatusCard';

describe('DeviceStatusCard Component', () => {
  test('renders device status information correctly', () => {
    const mockData = {
      totalDevices: 100,
      activeDevices: 75,
      offlineDevices: 25,
      deployedDevices: 80
    };
    
    render(<DeviceStatusCard data={mockData} />);
    
    // Check if the component renders the data correctly
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    
    // Check for labels
    expect(screen.getByText(/total devices/i)).toBeInTheDocument();
    expect(screen.getByText(/active devices/i)).toBeInTheDocument();
    expect(screen.getByText(/offline devices/i)).toBeInTheDocument();
    expect(screen.getByText(/deployed devices/i)).toBeInTheDocument();
  });
  
  test('displays loading state when data is not available', () => {
    render(<DeviceStatusCard data={null} />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  test('applies the correct styling for status indicators', () => {
    const mockData = {
      totalDevices: 100,
      activeDevices: 75,
      offlineDevices: 25,
      deployedDevices: 80
    };
    
    render(<DeviceStatusCard data={mockData} />);
    
    // Check if the active devices number has a green color class
    const activeElement = screen.getByText('75').closest('div');
    expect(activeElement).toHaveClass('text-green-500');
    
    // Check if the offline devices number has a red color class
    const offlineElement = screen.getByText('25').closest('div');
    expect(offlineElement).toHaveClass('text-red-500');
  });
});