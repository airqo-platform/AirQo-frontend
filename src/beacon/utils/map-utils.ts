
import { MaintenanceMapItem } from "@/types/api.types";

/**
 * Calculates the Great Circle distance between two points in kilometers using the Haversine formula.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
}

/**
 * Calculates the initial bearing between two points.
 */
export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const startLat = deg2rad(lat1);
    const startLng = deg2rad(lon1);
    const destLat = deg2rad(lat2);
    const destLng = deg2rad(lon2);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = Math.atan2(y, x);
    return (brng * 180 / Math.PI + 360) % 360;
}

/**
 * Calculates the criticality score of a device based on its health metrics.
 * Higher score means more critical.
 * Score range: 0 to 100 (approx)
 */
export const calculateCriticalityScore = (device: MaintenanceMapItem): number => {
    let score = 0;

    // Uptime contribution (0-50 pts)
    // Uptime is in hours (0-24). Convert to percentage (0-100).
    // Low uptime = high score
    const uptimePercent = (device.avg_uptime / 24) * 100;
    const uptimeScore = Math.max(0, 100 - uptimePercent); // 0% uptime = 100 raw, 100% uptime = 0 raw
    score += uptimeScore * 0.5;

    // Error margin contribution (0-50 pts)
    // High error = high score
    // User says > 10 is worrying. Let's scale it so 10 is significant but not max, and, say, 50 is max penalty.
    // If error is 0-10, small penalty. If > 10, ramps up.
    const errorScore = Math.min(100, device.avg_error_margin * 2); // 10 margin -> 20 pts, 25 margin -> 50 pts
    score += errorScore * 0.5;

    return Math.min(100, Math.max(0, score));
}

interface RouteOptimizationPreferences {
    weightDistance: number;    // 0-1, how much distance matters (vs jumping around)
    weightCriticality: number; // 0-1, preference for visiting critical nodes first
    weightAirQloud: number;    // 0-1, preference for staying in same airqloud
    startDevice?: MaintenanceMapItem; // Optional starting point
}

/**
 * Optimizes a route through a set of devices using a Weighted Nearest Neighbor heuristic.
 */
export const optimizeRoute = (
    devices: MaintenanceMapItem[],
    preferences: RouteOptimizationPreferences
): MaintenanceMapItem[] => {
    if (devices.length <= 1) return devices;

    const unvisited = [...devices];
    const route: MaintenanceMapItem[] = [];

    // Determine start node
    let current: MaintenanceMapItem;
    if (preferences.startDevice && unvisited.find(d => d.device_id === preferences.startDevice?.device_id)) {
        current = unvisited.find(d => d.device_id === preferences.startDevice?.device_id)!;
        // Remove start device from unvisited if it's in the list
        const idx = unvisited.findIndex(d => d.device_id === current.device_id);
        if (idx > -1) unvisited.splice(idx, 1);
    } else {
        // If no start device, pick the one with highest criticality (most urgent)
        // or just the first one if weights allow
        unvisited.sort((a, b) => calculateCriticalityScore(b) - calculateCriticalityScore(a));
        current = unvisited.shift()!;
    }

    route.push(current);

    while (unvisited.length > 0) {
        let bestScore = -Infinity;
        let bestCandidateIndex = -1;

        for (let i = 0; i < unvisited.length; i++) {
            const candidate = unvisited[i];

            // Calculate components
            const dist = calculateDistance(
                current.latitude, current.longitude,
                candidate.latitude, candidate.longitude
            );

            const criticality = calculateCriticalityScore(candidate);

            // AirQloud match? (1 if shares at least one airqloud, 0 otherwise)
            const sameAirQloud = current.airqlouds.some(aq => candidate.airqlouds.includes(aq)) ? 1 : 0;

            // Normalize distance score (inverse distance, closer is better)
            // Cap max distance impact at say 500km to avoid near-zero comparisons for far items
            // simple inverse: 1 / (d + 1)
            const distScore = 100 / (dist + 1);

            // Weighted score calculation
            // We want to maximize this score
            const totalScore =
                (distScore * preferences.weightDistance) +
                (criticality * preferences.weightCriticality) +
                (sameAirQloud * 100 * preferences.weightAirQloud);

            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestCandidateIndex = i;
            }
        }

        if (bestCandidateIndex !== -1) {
            current = unvisited[bestCandidateIndex];
            route.push(current);
            unvisited.splice(bestCandidateIndex, 1);
        } else {
            // Fallback (shouldn't happen with simple logic)
            break;
        }
    }

    return route;
}

/**
 * Checks if point C is near the line segment AB.
 * Returns true if the perpendicular distance is within bufferKm and projection is on segment.
 */
const isPointNearShowPath = (
    latA: number, lonA: number,
    latB: number, lonB: number,
    latC: number, lonC: number,
    bufferKm: number
): boolean => {
    // Basic implementation: if distance(A,C) + distance(C,B) approx equals distance(A,B)
    // Or perpendicular distance check

    const distAB = calculateDistance(latA, lonA, latB, lonB);
    const distAC = calculateDistance(latA, lonA, latC, lonC);
    const distCB = calculateDistance(latC, lonC, latB, lonB);

    // If point is too far basically from both endpoints, ignore
    if (distAC > distAB + bufferKm && distCB > distAB + bufferKm) return false;

    // Allow some slack. If C is on line AB, distAC + distCB = distAB.
    // We check if the detour is small: (distAC + distCB) - distAB < detourThreshold
    // This is often more practical for "opportunistic" than strict perpendicular buffer
    // For a buffer of X km, the detour is roughly 2*sqrt(X^2 + (distAB/2)^2) - distAB if we assume worst case
    // Let's us a simple "detour factor". If going to C adds less than X km to the trip.

    // We use a detour allowance. e.g. 5km extra travel is acceptable
    const detour = (distAC + distCB) - distAB;

    return detour <= bufferKm; // Reuse bufferKm as "max added detour" which is a good proxy
}

/**
 * Finds devices that are along the path of the given route but not part of it.
 * @param route Ordered list of devices in the route
 * @param allDevices All available devices candidates
 * @param bufferKm How much extra travel (detour) is acceptable to include a stop
 */
export const findDevicesAlongRoute = (
    route: MaintenanceMapItem[],
    allDevices: MaintenanceMapItem[],
    bufferKm: number = 10
): MaintenanceMapItem[] => {
    if (route.length < 2) return [];

    const routeIds = new Set(route.map(d => d.device_id));
    const suggestions = new Set<MaintenanceMapItem>();

    // Iterate through each leg of the route
    for (let i = 0; i < route.length - 1; i++) {
        const start = route[i];
        const end = route[i + 1];

        // Check all non-route devices
        for (const device of allDevices) {
            if (routeIds.has(device.device_id)) continue;
            if (suggestions.has(device)) continue;

            // Optimization: bounding box check could speed this up for large datasets
            // Simple approach for now
            if (isPointNearShowPath(
                start.latitude, start.longitude,
                end.latitude, end.longitude,
                device.latitude, device.longitude,
                bufferKm
            )) {
                // Also check if it has ANY maintenance need (score > 10 maybe?)
                if (calculateCriticalityScore(device) > 10) {
                    suggestions.add(device);
                }
            }
        }
    }

    return Array.from(suggestions);
}
