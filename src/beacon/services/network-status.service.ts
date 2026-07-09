import { buildPlatformApiUrl } from '@/lib/config';
import authService from './api-service';

export interface NetworkStatusAlert {
  _id: string;
  checked_at: string;
  total_deployed_devices: number;
  operational_count: number;
  transmitting_count: number;
  data_available_count: number;
  not_transmitting_devices_count: number;
  not_transmitting_percentage: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  threshold_exceeded: boolean;
  threshold_value: number;
  createdAt: string;
}

export interface NetworkStatistics {
  totalAlerts: number;
  avg_operational_count: number;
  avg_transmitting_count: number;
  avg_data_available_count: number;
  avg_not_transmitting_percentage: number;
  max_not_transmitting_percentage: number;
  min_not_transmitting_percentage: number;
  warningCount: number;
  criticalCount: number;
}

export interface HourlyTrend {
  _id: {
    hour: number;
    dayOfWeek: number;
  };
  avg_not_transmitting_percentage: number;
  count: number;
}

export interface UptimeSummaryItem {
  _id: string; // YYYY-MM-DD
  avgOfflinePercentage: number;
  maxOfflinePercentage: number;
  minOfflinePercentage: number;
  totalChecks: number;
  alertsTriggered: number;
}

export interface NetworkBreakdownItem {
  _id: string; // network name (e.g. airqo, airgradient)
  totalChecks: number;
  avg_total_monitors: number;
  avg_not_transmitting_percentage: number;
  max_not_transmitting_percentage: number;
  min_not_transmitting_percentage: number;
}

export interface NetworkBreakdownResponse {
  success: boolean;
  data: NetworkBreakdownItem[];
}

export interface DeviceSummaryCountResponse {
  success: boolean;
  data: {
    total_monitors: number;
    operational: number;
    transmitting: number;
    data_available: number;
    not_transmitting: number;
  };
}

class NetworkStatusService {
  private readonly baseUrl = buildPlatformApiUrl('devices/network-status', 'v2');

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = authService.getToken();
    if (token) {
      // API documentation states: Authorization: JWT <token>
      // We prepend 'JWT ' if not already formatted with 'Bearer' or 'JWT'
      headers['Authorization'] = token.startsWith('JWT ') || token.startsWith('Bearer') 
        ? token 
        : `JWT ${token}`;
    }
    return headers;
  }

  private async fetchFromApi<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAlerts(params?: {
    limit?: number;
    skip?: number;
    start_date?: string;
    end_date?: string;
    status?: 'OK' | 'WARNING' | 'CRITICAL';
    threshold_exceeded?: boolean;
    network?: string;
  }): Promise<{ success: boolean; alerts: NetworkStatusAlert[] }> {
    return this.fetchFromApi<{ success: boolean; alerts: NetworkStatusAlert[] }>('/', params);
  }

  async getStatistics(params?: {
    start_date?: string;
    end_date?: string;
    network?: string;
  }): Promise<{ success: boolean; statistics: NetworkStatistics[] }> {
    return this.fetchFromApi<{ success: boolean; statistics: NetworkStatistics[] }>('/statistics', params);
  }

  async getHourlyTrends(params?: {
    start_date?: string;
    end_date?: string;
    network?: string;
  }): Promise<{ success: boolean; trends: HourlyTrend[] }> {
    return this.fetchFromApi<{ success: boolean; trends: HourlyTrend[] }>('/trends/hourly', params);
  }

  async getRecentAlerts(hours = 24, network?: string): Promise<{ success: boolean; alerts: NetworkStatusAlert[] }> {
    return this.fetchFromApi<{ success: boolean; alerts: NetworkStatusAlert[] }>('/recent', { hours, network });
  }

  async getUptimeSummary(days = 7, network?: string): Promise<{ success: boolean; summary: UptimeSummaryItem[] }> {
    return this.fetchFromApi<{ success: boolean; summary: UptimeSummaryItem[] }>('/uptime-summary', { days, network });
  }

  async getNetworkBreakdown(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<NetworkBreakdownResponse> {
    return this.fetchFromApi<NetworkBreakdownResponse>('/breakdown', params);
  }

  async getDeviceSummaryCount(network?: string): Promise<DeviceSummaryCountResponse> {
    const baseUrl = buildPlatformApiUrl('devices/summary/count', 'v2');
    const url = new URL(baseUrl);
    if (network) {
      url.searchParams.append('network', network);
    }
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}

export const networkStatusService = new NetworkStatusService();
