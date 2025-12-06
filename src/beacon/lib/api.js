// lib/api.js
// API utility functions for device management

/**
 * Fetch device statistics from API
 */
export async function fetchDeviceStats() {
  const response = await fetch('/api/devices/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch device statistics');
  }
  return response.json();
}

/**
 * Fetch device list from API
 */
export async function fetchDeviceList() {
  const response = await fetch('/api/devices/list');
  if (!response.ok) {
    throw new Error('Failed to fetch device list');
  }
  return response.json();
}

/**
 * Fetch device failures from API
 */
export async function fetchDeviceFailures() {
  const response = await fetch('/api/devices/failures');
  if (!response.ok) {
    throw new Error('Failed to fetch device failures');
  }
  return response.json();
}

/**
 * Get all devices - alias for fetchDeviceList
 */
export async function getDevices() {
  return fetchDeviceList();
}