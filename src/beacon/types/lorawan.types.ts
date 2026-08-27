export type GatewayEnvironment = 'urban' | 'suburban' | 'rural';

export interface LoRaWANGateway {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  environment?: GatewayEnvironment; // 'urban' (2-5km), 'suburban' (5-7km), 'rural' (10km)
  antenna_height_m?: number; // Gateway antenna height in meters (e.g. 20m, 30m)
  max_range_km?: number; // Custom maximum range override
  inner_strong_radius_km?: number; // Custom strong signal radius override
  eui?: string; // Gateway EUI e.g. "A84041FFFF21B8C0"
  frequency_band?: string; // e.g. "EU868", "US915", "AS923"
  description?: string;
  enabled?: boolean;
}

export type SignalQuality = 'strong' | 'moderate' | 'weak' | 'none';

export interface SignalAttenuationInfo {
  distanceKm: number;
  estimatedRssiDbm: number;
  estimatedSnrDb: number;
  quality: SignalQuality;
  recommendedSpreadingFactor: string; // e.g. 'SF7', 'SF8', 'SF10', 'SF12'
}

export interface GatewayCoverageZone {
  label: string;
  radiusKm: number;
  quality: SignalQuality;
  description: string;
  fillColor: string;
  fillOpacity: number;
  borderColor: string;
  borderWidth: number;
  dashArray?: string;
}

export interface GatewayDeviceCoverage {
  deviceId: string;
  deviceName: string;
  latitude: number;
  longitude: number;
  nearestGatewayId: string;
  nearestGatewayName: string;
  distanceKm: number;
  signalQuality: SignalQuality;
  estimatedRssiDbm: number;
}

// Backward-compatible alias for existing imports
export type GatewayCoverageDeviceMapItem = GatewayDeviceCoverage;
export interface GatewayCoverageStats {
  totalGateways: number;
  activeGateways: number;
  totalDevices: number;
  coveredDevices: number;
  uncoveredDevices: number;
  coveragePercentage: number;
  strongCoverageCount: number;
  moderateCoverageCount: number;
  weakCoverageCount: number;
  deviceCoverageMap: Record<string, GatewayDeviceCoverage>;
}

export interface MapExportOptions {
  format: 'png' | 'jpeg' | 'pdf' | 'geojson' | 'csv';
  title?: string;
  includeGateways?: boolean;
  includeLegend?: boolean;
  includeRoute?: boolean;
  includeSummaryTable?: boolean;
  paperSize?: 'a4' | 'letter';
  orientation?: 'landscape' | 'portrait';
}
