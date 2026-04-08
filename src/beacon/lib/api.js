// API utility functions for device management
import { buildApiUrl } from './config';
import authService from '@/services/api-service';

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

/**
 * Fetch collocation sites with query parameters.
 * Sends the JWT from authService in the Authorization header.
 */
export async function fetchCollocationSites(params = {}) {
  const query = new URLSearchParams(params).toString();
  const path = `/collocation/sites${query ? `?${query}` : ''}`;
  const url = buildApiUrl(path);

  const headers = {};
  const token = authService.getToken();
  if (token) headers['Authorization'] = token;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch collocation sites');
  }
  return response.json();
}

/**
 * Fetch specific collocation site details with query parameters.
 */
export async function fetchCollocationSiteDetails(id, params = {}) {
  const query = new URLSearchParams(params).toString();
  const path = `/collocation/sites/${id}${query ? `?${query}` : ''}`;
  const url = buildApiUrl(path);

  const headers = {};
  const token = authService.getToken();
  if (token) headers['Authorization'] = token;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch collocation site details');
  }
  return response.json();
}