import { MaintenanceMapItem } from "@/types/api.types";
import {
  LoRaWANGateway,
  GatewayEnvironment,
  GatewayCoverageZone,
  SignalAttenuationInfo,
  SignalQuality,
  GatewayCoverageStats,
  GatewayDeviceCoverage,
} from "@/types/lorawan.types";
import { calculateDistance } from "@/utils/map-utils";
export { calculateDistance };

export const LORAWAN_STORAGE_KEY = "airqo_beacon_lorawan_gateways";

/**
 * Default RF coverage factors based on terrain and environment:
 * - Urban: Dense concrete obstructions (e.g. Kampala), 2-5 km range.
 * - Suburban: Moderate buildings and foliage, 5-7 km range.
 * - Rural: Open layout with minimal obstructions, reaching up to 10 km.
 */
export const ENVIRONMENT_PROFILES: Record<
  GatewayEnvironment,
  {
    label: string;
    description: string;
    pathLossExponent: number; // n in log-distance path loss
    strongRadiusKm: number;
    moderateRadiusKm: number;
    maxRadiusKm: number;
  }
> = {
  urban: {
    label: "Dense Urban (e.g. Kampala)",
    description: "Reduced spread (2–5 km) due to concrete buildings & multi-path interference",
    pathLossExponent: 3.8,
    strongRadiusKm: 2.0,
    moderateRadiusKm: 5.0,
    maxRadiusKm: 5.0,
  },
  suburban: {
    label: "Suburban",
    description: "Moderate built-up spread (5–7 km) with mixed residential & light foliage",
    pathLossExponent: 3.0,
    strongRadiusKm: 3.5,
    moderateRadiusKm: 5.5,
    maxRadiusKm: 7.0,
  },
  rural: {
    label: "Rural / Open Layout",
    description: "Maximum distance up to 10 km with clear line-of-sight & low interference",
    pathLossExponent: 2.5,
    strongRadiusKm: 5.0,
    moderateRadiusKm: 8.0,
    maxRadiusKm: 10.0,
  },
};

/**
 * Realistic sample LoRaWAN gateways deployed across Kampala & Greater Central Uganda
 */
export const KAMPALA_SAMPLE_GATEWAYS: LoRaWANGateway[] = [
  {
    id: "gw-muk-01",
    name: "Muk Gateway",
    latitude: 0.33415,
    longitude: 32.57028,
    environment: "urban",
    antenna_height_m: 35,
    max_range_km: 5.0,
    inner_strong_radius_km: 2.0,
    eui: "A84041FFFF210001",
    frequency_band: "EU868",
    description: "Altitude: 1195m ASL. High elevation gateway at Makerere University covering Central Kampala & Wandegeya.",
    enabled: true,
  },
  {
    id: "gw-mug-02",
    name: "Gateway at Muganzirwaza",
    latitude: 0.29526,
    longitude: 32.57249,
    environment: "urban",
    antenna_height_m: 30,
    max_range_km: 5.0,
    inner_strong_radius_km: 2.0,
    eui: "A84041FFFF210002",
    frequency_band: "EU868",
    description: "Urban gateway at Muganzirwaza Complex covering Katwe, Kibuye, Ndeeba and South Kampala.",
    enabled: true,
  },
  {
    id: "gw-ggaba-03",
    name: "Gateway at NWSC-Ggaba",
    latitude: 0.25126,
    longitude: 32.63737,
    environment: "suburban",
    antenna_height_m: 30,
    max_range_km: 7.0,
    inner_strong_radius_km: 3.5,
    eui: "A84041FFFF210003",
    frequency_band: "EU868",
    description: "Water treatment plant gateway with clear line-of-sight across Ggaba, Munyonyo and Lake Victoria shore.",
    enabled: true,
  },
  {
    id: "gw-nkozi-04",
    name: "Masaka Nkozi Gateway",
    latitude: 0.00273,
    longitude: 32.01378,
    environment: "rural",
    antenna_height_m: 40,
    max_range_km: 10.0,
    inner_strong_radius_km: 5.0,
    eui: "A84041FFFF210004",
    frequency_band: "EU868",
    description: "Altitude: 1250m ASL. Elevated mast at Uganda Martyrs University Nkozi / Masaka Highway with up to 10 km reach.",
    enabled: true,
  },
  {
    id: "gw-soroti-05",
    name: "Gateway at Soroti",
    latitude: 1.7656607,
    longitude: 33.6272319,
    environment: "rural",
    antenna_height_m: 40,
    max_range_km: 10.0,
    inner_strong_radius_km: 5.0,
    eui: "A84041FFFF210005",
    frequency_band: "EU868",
    description: "Eastern Uganda regional hub gateway in Soroti with open terrain propagation up to 10 km.",
    enabled: true,
  },
];

/**
 * Calculates estimated RSSI (dBm) and signal metrics using the Log-Distance Path Loss Model:
 * PL(d) = PL(d0) + 10 * n * log10(d / d0) - (AntennaHeightGain)
 */
export function calculateSignalAttenuation(
  distanceKm: number,
  gateway: LoRaWANGateway
): SignalAttenuationInfo {
  const envKey: GatewayEnvironment = gateway.environment || "urban";
  const profile = ENVIRONMENT_PROFILES[envKey] || ENVIRONMENT_PROFILES.urban;

  const d = Math.max(0.05, distanceKm); // avoid log(0)
  const maxRange = gateway.max_range_km ?? profile.maxRadiusKm;
  const strongRange = gateway.inner_strong_radius_km ?? profile.strongRadiusKm;

  // Path loss calculation
  // Reference path loss at 1 km for 868 MHz ≈ 91 dB
  const pl0 = 91.0;
  const n = profile.pathLossExponent;
  const antennaHeight = gateway.antenna_height_m || 25;
  const heightCorrection = Math.max(0, 10 * Math.log10(antennaHeight / 10));

  const pathLoss = pl0 + 10 * n * Math.log10(d) - heightCorrection;

  // Tx power = 14 dBm, Tx Antenna Gain = 3 dBi, Rx Gain = 2 dBi
  const txPower = 14;
  const totalGain = 5;
  const rssi = Math.round(txPower + totalGain - pathLoss);

  // SNR estimate roughly scales with RSSI (-20 dB at edge to +10 dB near tower)
  const snr = Math.max(-20, Math.min(10, Math.round((rssi + 120) / 4 - 15)));

  let quality: SignalQuality = "none";
  let recommendedSpreadingFactor = "Out of Range";

  if (distanceKm <= strongRange) {
    quality = "strong";
    recommendedSpreadingFactor = "SF7 / SF8 (Fastest, High Throughput)";
  } else if (distanceKm <= maxRange) {
    quality = "moderate";
    recommendedSpreadingFactor = distanceKm <= (strongRange + maxRange) / 2 ? "SF9 / SF10" : "SF11 / SF12";
  } else if (distanceKm <= maxRange * 1.15) {
    quality = "weak";
    recommendedSpreadingFactor = "SF12 (Fringe Coverage / Potential Packet Loss)";
  } else {
    quality = "none";
    recommendedSpreadingFactor = "Disconnected (Signal Drop)";
  }

  return {
    distanceKm,
    estimatedRssiDbm: Math.max(-130, Math.min(-45, rssi)),
    estimatedSnrDb: snr,
    quality,
    recommendedSpreadingFactor,
  };
}

/**
 * Returns concentric coverage zones (radii) for a gateway based on its environment and range parameters
 */
export function getGatewayCoverageZones(gateway: LoRaWANGateway): GatewayCoverageZone[] {
  const envKey: GatewayEnvironment = gateway.environment || "urban";
  const profile = ENVIRONMENT_PROFILES[envKey] || ENVIRONMENT_PROFILES.urban;

  const maxRange = gateway.max_range_km ?? profile.maxRadiusKm;
  const strongRange = gateway.inner_strong_radius_km ?? profile.strongRadiusKm;

  // Determine middle boundary
  const moderateRange = envKey === "urban" ? Math.min(maxRange, 5.0) : Math.min(maxRange, profile.moderateRadiusKm);

  return [
    {
      label: `Strong Signal Zone (≤ ${strongRange.toFixed(1)} km)`,
      radiusKm: strongRange,
      quality: "strong",
      description: "Excellent link quality (RSSI > -90 dBm), SF7/SF8, minimal packet loss",
      fillColor: "#10b981", // emerald-500
      fillOpacity: 0.18,
      borderColor: "#059669", // emerald-600
      borderWidth: 2,
    },
    {
      label: `Moderate Signal Zone (${strongRange.toFixed(1)} – ${moderateRange.toFixed(1)} km)`,
      radiusKm: moderateRange,
      quality: "moderate",
      description:
        envKey === "urban"
          ? "Typical urban limit in Kampala due to concrete multi-path attenuation (RSSI -90 to -110 dBm)"
          : "Standard coverage boundary (RSSI -90 to -110 dBm)",
      fillColor: "#f59e0b", // amber-500
      fillOpacity: 0.11,
      borderColor: "#d97706", // amber-600
      borderWidth: 1.5,
    },
    {
      label: `Max Reach / Signal Drop Radius (≤ ${maxRange.toFixed(1)} km)`,
      radiusKm: maxRange,
      quality: "weak",
      description:
        envKey === "rural"
          ? "Maximum line-of-sight reach (up to 10 km) in open layout without major physical obstructions"
          : `Maximum effective radius (${maxRange.toFixed(1)} km); packet drops increase sharply beyond this threshold`,
      fillColor: "#ef4444", // red-500
      fillOpacity: 0.05,
      borderColor: "#dc2626", // red-600
      borderWidth: 1.5,
      dashArray: "4, 6",
    },
  ];
}

/**
 * Calculates coverage stats between a set of gateways and maintenance map devices
 */
export function computeGatewayCoverageStats(
  gateways: LoRaWANGateway[],
  devices: MaintenanceMapItem[]
): GatewayCoverageStats {
  const activeGateways = gateways.filter((g) => g.enabled !== false && g.latitude != null && g.longitude != null);
  const deviceCoverageMap: Record<string, GatewayDeviceCoverage> = {};

  let strongCount = 0;
  let moderateCount = 0;
  let weakCount = 0;
  let coveredCount = 0;

  devices.forEach((device) => {
    if (device.latitude == null || device.longitude == null) return;

    let closestGateway: LoRaWANGateway | null = null;
    let minDistance = Infinity;

    for (const gw of activeGateways) {
      const dist = calculateDistance(device.latitude, device.longitude, gw.latitude, gw.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestGateway = gw;
      }
    }

    if (closestGateway) {
      const attenuation = calculateSignalAttenuation(minDistance, closestGateway);
      const isCovered = attenuation.quality !== "none";

      if (isCovered) {
        coveredCount++;
        if (attenuation.quality === "strong") strongCount++;
        else if (attenuation.quality === "moderate") moderateCount++;
        else if (attenuation.quality === "weak") weakCount++;
      }

      deviceCoverageMap[device.device_id] = {
        deviceId: device.device_id,
        deviceName: device.device_name,
        latitude: device.latitude,
        longitude: device.longitude,
        nearestGatewayId: closestGateway.id,
        nearestGatewayName: closestGateway.name,
        distanceKm: Number(minDistance.toFixed(2)),
        signalQuality: attenuation.quality,
        estimatedRssiDbm: attenuation.estimatedRssiDbm,
      };
    } else {
      deviceCoverageMap[device.device_id] = {
        deviceId: device.device_id,
        deviceName: device.device_name,
        latitude: device.latitude,
        longitude: device.longitude,
        nearestGatewayId: "",
        nearestGatewayName: "None",
        distanceKm: 0,
        signalQuality: "none",
        estimatedRssiDbm: -130,
      };
    }
  });

  const totalDevices = devices.length;
  const uncoveredDevices = totalDevices - coveredCount;
  const coveragePercentage = totalDevices > 0 ? Math.round((coveredCount / totalDevices) * 100) : 0;

  return {
    totalGateways: gateways.length,
    activeGateways: activeGateways.length,
    totalDevices,
    coveredDevices: coveredCount,
    uncoveredDevices,
    coveragePercentage,
    strongCoverageCount: strongCount,
    moderateCoverageCount: moderateCount,
    weakCoverageCount: weakCount,
    deviceCoverageMap,
  };
}

/**
 * Flexible parser supporting Arrays, GeoJSON FeatureCollections, and Nested JSON objects
 */
export function parseLoRaWANGatewayJSON(input: unknown): LoRaWANGateway[] {
  let parsed: any = input;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      parsed = JSON.parse(trimmed);
    } catch (e: any) {
      throw new Error(`Invalid JSON syntax: ${e?.message || "Check formatting"}`);
    }
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Input must be a valid JSON Array or GeoJSON Object.");
  }

  // Handle GeoJSON FeatureCollection
  if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
    return parsed.features
      .map((f: any, idx: number) => parseGeoJsonFeature(f, idx))
      .filter((g: LoRaWANGateway | null): g is LoRaWANGateway => g !== null);
  }

  // Handle Single GeoJSON Feature
  if (parsed.type === "Feature" && parsed.geometry) {
    const gw = parseGeoJsonFeature(parsed, 0);
    return gw ? [gw] : [];
  }

  // Handle nested object with array property or key-value dictionary map
  let itemsArray: any[] = [];
  if (Array.isArray(parsed)) {
    itemsArray = parsed;
  } else if (Array.isArray(parsed.gateways)) {
    itemsArray = parsed.gateways;
  } else if (Array.isArray(parsed.data)) {
    itemsArray = parsed.data;
  } else if (Array.isArray(parsed.items)) {
    itemsArray = parsed.items;
  } else if (Array.isArray(parsed.features)) {
    itemsArray = parsed.features;
  } else if (typeof parsed === "object") {
    // Check if it is a dictionary/map of gateway objects: { "Gateway Name": { latitude, longitude, altitude }, ... }
    const entries = Object.entries(parsed);
    const isGatewayMap = entries.length > 0 && entries.every(([_, val]) => {
      return val && typeof val === "object" && (extractCoordinate(val, "lat") !== null || (val as any).latitude != null || (val as any).lat != null);
    });

    if (isGatewayMap) {
      itemsArray = entries.map(([keyName, valObj]: [string, any]) => {
        return {
          name: valObj.name || valObj.gateway_name || keyName,
          ...valObj,
        };
      });
    } else if (extractCoordinate(parsed, "lat") !== null && extractCoordinate(parsed, "lng") !== null) {
      itemsArray = [parsed];
    } else {
      throw new Error("No gateway items, dictionary entries, or GeoJSON features found in the provided JSON.");
    }
  } else {
    throw new Error("No gateway items found in the provided JSON.");
  }

  const result: LoRaWANGateway[] = [];

  itemsArray.forEach((item, index) => {
    if (!item || typeof item !== "object") return;

    // Check if it is a GeoJSON Feature
    if (item.type === "Feature" && item.geometry) {
      const g = parseGeoJsonFeature(item, index);
      if (g) result.push(g);
      return;
    }

    const lat = extractCoordinate(item, "lat");
    const lng = extractCoordinate(item, "lng");

    if (lat === null || lng === null) return;

    const name =
      item.name ||
      item.gateway_name ||
      item.label ||
      item.title ||
      item.id ||
      item.eui ||
      `Gateway #${index + 1}`;

    const id = item.id || item.gateway_id || item.eui || `gw-${Date.now()}-${index}`;

    // Normalize environment: urban (2-5km), suburban (5-7km), rural (10km)
    let env: GatewayEnvironment = "urban";
    const rawEnv = String(item.environment || item.env || item.terrain || item.spread || "").toLowerCase();
    const nameLower = String(name).toLowerCase();

    if (rawEnv.includes("rur") || rawEnv.includes("open") || nameLower.includes("soroti") || nameLower.includes("masaka") || nameLower.includes("nkozi") || nameLower.includes("rural") || nameLower.includes("open")) {
      env = "rural";
    } else if (rawEnv.includes("sub") || rawEnv.includes("semi") || nameLower.includes("ggaba") || nameLower.includes("nwsc") || nameLower.includes("namanve") || nameLower.includes("lake")) {
      env = "suburban";
    } else if (rawEnv.includes("urb") || rawEnv.includes("kampala") || rawEnv.includes("city") || nameLower.includes("muk") || nameLower.includes("makerere") || nameLower.includes("muganzirwaza") || nameLower.includes("kololo")) {
      env = "urban";
    } else if (lat < 0.2 || lat > 0.5 || lng < 32.4 || lng > 32.7) {
      // Coordinates outside greater Kampala metro area default to rural open spread
      env = "rural";
    }

    const antennaHeight = toNumber(item.antenna_height_m ?? item.antenna_height ?? item.height ?? item.tower_height, 25);
    const maxRange = toNumber(item.max_range_km ?? item.range_km ?? item.range ?? item.max_distance, undefined);
    const innerRadius = toNumber(item.inner_strong_radius_km ?? item.strong_radius_km ?? item.inner_radius, undefined);
    const altitude = item.altitude != null ? Number(item.altitude) : undefined;

    result.push({
      id: String(id),
      name: String(name),
      latitude: lat,
      longitude: lng,
      environment: env,
      antenna_height_m: antennaHeight,
      max_range_km: maxRange,
      inner_strong_radius_km: innerRadius,
      eui: item.eui ? String(item.eui) : undefined,
      frequency_band: item.frequency_band || item.frequency || "EU868",
      description: altitude != null ? `Altitude: ${altitude}m ASL` : (item.description ? String(item.description) : undefined),
      enabled: item.enabled !== false,
    });
  });

  if (result.length === 0) {
    throw new Error(
      "Could not extract any valid gateways. Please ensure each item has latitude and longitude coordinates."
    );
  }

  return result;
}

function parseGeoJsonFeature(feature: any, index: number): LoRaWANGateway | null {
  if (!feature.geometry || feature.geometry.type !== "Point" || !Array.isArray(feature.geometry.coordinates)) {
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const props = feature.properties || {};
  const name = props.name || props.gateway_name || props.title || `Gateway #${index + 1}`;
  const id = feature.id || props.id || props.eui || `gw-${Date.now()}-${index}`;

  let env: GatewayEnvironment = "urban";
  const rawEnv = String(props.environment || props.env || props.terrain || "").toLowerCase();
  if (rawEnv.includes("rur") || rawEnv.includes("open")) env = "rural";
  else if (rawEnv.includes("sub")) env = "suburban";

  return {
    id: String(id),
    name: String(name),
    latitude: lat,
    longitude: lng,
    environment: env,
    antenna_height_m: toNumber(props.antenna_height_m ?? props.antenna_height ?? props.height, 25),
    max_range_km: toNumber(props.max_range_km ?? props.range_km ?? props.range, undefined),
    inner_strong_radius_km: toNumber(props.inner_strong_radius_km, undefined),
    eui: props.eui ? String(props.eui) : undefined,
    frequency_band: props.frequency_band || "EU868",
    description: props.description ? String(props.description) : undefined,
    enabled: props.enabled !== false,
  };
}

function extractCoordinate(obj: any, type: "lat" | "lng"): number | null {
  if (!obj || typeof obj !== "object") return null;

  const latKeys = ["latitude", "lat", "lat_deg", "Latitude", "LAT", "y"];
  const lngKeys = ["longitude", "lng", "lon", "long", "lng_deg", "Longitude", "LNG", "LON", "x"];
  const keys = type === "lat" ? latKeys : lngKeys;

  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      const n = Number(obj[k]);
      if (Number.isFinite(n) && (type === "lat" ? n >= -90 && n <= 90 : n >= -180 && n <= 180)) {
        return n;
      }
    }
  }

  // Check nested location or coordinates object
  if (obj.location && typeof obj.location === "object") {
    return extractCoordinate(obj.location, type);
  }
  if (obj.position && typeof obj.position === "object") {
    return extractCoordinate(obj.position, type);
  }

  // Check coordinates array [lng, lat]
  if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
    const idx = type === "lng" ? 0 : 1;
    const n = Number(obj.coordinates[idx]);
    if (Number.isFinite(n)) return n;
  }

  return null;
}

function toNumber(val: any, fallback?: number): number | undefined {
  if (val === undefined || val === null || val === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Storage helpers
 */
export function loadGatewaysFromStorage(): LoRaWANGateway[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LORAWAN_STORAGE_KEY);
    if (!raw) return [];
    return parseLoRaWANGatewayJSON(raw);
  } catch (err) {
    console.error("Failed to load gateways from storage", err);
    return [];
  }
}

export function saveGatewaysToStorage(gateways: LoRaWANGateway[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LORAWAN_STORAGE_KEY, JSON.stringify(gateways, null, 2));
  } catch (err) {
    console.error("Failed to save gateways to storage", err);
  }
}

/**
 * Converts map dataset & LoRaWAN layers into standard GeoJSON FeatureCollection
 */
export function generateMapGeoJSON(
  devices: MaintenanceMapItem[],
  gateways: LoRaWANGateway[],
  routePath?: MaintenanceMapItem[]
): object {
  const features: any[] = [];

  // 1. Devices
  devices.forEach((d) => {
    if (d.latitude == null || d.longitude == null) return;
    features.push({
      type: "Feature",
      id: d.device_id,
      geometry: {
        type: "Point",
        coordinates: [d.longitude, d.latitude],
      },
      properties: {
        layer: "AirQo Maintenance Devices",
        device_id: d.device_id,
        device_name: d.device_name,
        uptime_percentage: d.uptime,
        error_margin: d.error_margin,
        last_active: d.last_active,
        cohorts: d.cohorts,
      },
    });
  });

  // 2. LoRaWAN Gateways
  gateways.forEach((gw) => {
    if (gw.latitude == null || gw.longitude == null) return;
    const profile = ENVIRONMENT_PROFILES[gw.environment || "urban"];
    features.push({
      type: "Feature",
      id: gw.id,
      geometry: {
        type: "Point",
        coordinates: [gw.longitude, gw.latitude],
      },
      properties: {
        layer: "LoRaWAN Gateways",
        name: gw.name,
        eui: gw.eui,
        environment: gw.environment || "urban",
        antenna_height_m: gw.antenna_height_m,
        max_range_km: gw.max_range_km ?? profile.maxRadiusKm,
        strong_radius_km: gw.inner_strong_radius_km ?? profile.strongRadiusKm,
        description: gw.description,
        enabled: gw.enabled !== false,
      },
    });
  });

  // 3. Route Polyline
  if (routePath && routePath.length > 1) {
    const coords = routePath
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => [d.longitude, d.latitude]);

    if (coords.length > 1) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
        properties: {
          layer: "Optimized Maintenance Route",
          stops_count: coords.length,
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: "AirQo Beacon Maintenance Platform",
    },
    features,
  };
}
