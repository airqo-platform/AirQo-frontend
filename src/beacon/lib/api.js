// frontend/lib/api.js
export async function fetchDeviceStats() {
    const response = await fetch('/api/devices/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch device statistics');
    }
    return await response.json();
  }
  
  export async function fetchDeviceList() {
    const response = await fetch('/api/devices/list');
    if (!response.ok) {
      throw new Error('Failed to fetch device list');
    }
    return await response.json();
  }
  
  export async function fetchDeviceFailures() {
    const response = await fetch('/api/devices/failures');
    if (!response.ok) {
      throw new Error('Failed to fetch device failures');
    }
    return await response.json();
  }