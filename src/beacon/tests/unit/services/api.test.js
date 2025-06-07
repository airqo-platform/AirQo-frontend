import { fetchDevices, fetchDevicePerformance } from '../../../services/api';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

describe('API Service', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('fetchDevices returns device data successfully', async () => {
    const mockDevices = [
      { device_id: '1', device_name: 'Device 1', status: 'deployed' },
      { device_id: '2', device_name: 'Device 2', status: 'not deployed' }
    ];
    
    fetch.mockResponseOnce(JSON.stringify(mockDevices));
    
    const result = await fetchDevices();
    
    expect(result).toEqual(mockDevices);
    expect(fetch).toHaveBeenCalledWith('/api/devices', expect.any(Object));
  });
  
  test('fetchDevices handles errors', async () => {
    fetch.mockReject(new Error('API is down'));
    
    await expect(fetchDevices()).rejects.toThrow('API is down');
  });
  
  test('fetchDevicePerformance returns performance data for a device', async () => {
    const mockPerformance = {
      summary: {
        uptime: 98.5,
        dataCompleteness: 95.3
      },
      dailyData: [
        { date: '2023-01-01', uptime: 100, dataCompleteness: 98 }
      ]
    };
    
    fetch.mockResponseOnce(JSON.stringify(mockPerformance));
    
    const result = await fetchDevicePerformance('device-1');
    
    expect(result).toEqual(mockPerformance);
    expect(fetch).toHaveBeenCalledWith('/api/device-performance/device-1', expect.any(Object));
  });
});