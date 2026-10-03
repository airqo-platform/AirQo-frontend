export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface RoutePoint extends Coordinates {
    id: string;
    name?: string;
    [key: string]: any;
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * Returns distance in kilometers
 */
export const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

/**
 * Optimizes a route using the Nearest Neighbor algorithm.
 * Starts from a startPoint, visits all points, and returns to endPoint (usually same as start).
 */
export const calculateNearestNeighborRoute = <T extends RoutePoint>(
    startPoint: Coordinates,
    points: T[],
    endPoint: Coordinates = startPoint
): T[] => {
    if (points.length === 0) return [];

    const unvisited = [...points];
    const route: T[] = [];
    let currentLat = startPoint.latitude;
    let currentLon = startPoint.longitude;

    while (unvisited.length > 0) {
        let nearestIndex = -1;
        let minDist = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const dist = haversineDistance(
                currentLat,
                currentLon,
                unvisited[i].latitude,
                unvisited[i].longitude
            );

            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }

        if (nearestIndex !== -1) {
            const nextPoint = unvisited[nearestIndex];
            route.push(nextPoint);
            currentLat = nextPoint.latitude;
            currentLon = nextPoint.longitude;
            unvisited.splice(nearestIndex, 1);
        }
    }

    return route;
};

// ---------------------------------------------------------------------------
// Road-network routing (OSRM public demo server, free, no API key required).
// See https://project-osrm.org/docs/v5.24.0/api/ for the HTTP API.
// The demo server is rate-limited and intended for light use; a self-hosted
// OSRM instance can be pointed to via NEXT_PUBLIC_OSRM_BASE_URL.
// ---------------------------------------------------------------------------

export const OSRM_BASE_URL =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_OSRM_BASE_URL) ||
    "https://router.project-osrm.org";

/** The demo server rejects trip requests above this many coordinates. */
export const OSRM_MAX_TRIP_POINTS = 100;

export interface RoadRoute<T extends RoutePoint = RoutePoint> {
    /** Stops in visiting order (start/end point excluded). */
    order: T[];
    /** Road geometry as [lat, lng] pairs, from start, through every stop, back to end. */
    geometry: [number, number][];
    /** Total driving distance in kilometres. */
    distanceKm: number;
    /** Total driving time in minutes. */
    durationMin: number;
    /** Distance and time of each leg, index i = leg leaving stop i (or the start for i = 0). */
    legs: { distanceKm: number; durationMin: number }[];
}

const toCoordString = (points: Coordinates[]): string =>
    points.map((p) => `${p.longitude},${p.latitude}`).join(";");

const fetchOsrm = async (path: string, signal?: AbortSignal): Promise<any> => {
    const res = await fetch(`${OSRM_BASE_URL}${path}`, { signal });
    if (!res.ok) throw new Error(`OSRM request failed (${res.status})`);
    const json = await res.json();
    if (json.code !== "Ok") throw new Error(`OSRM error: ${json.code}${json.message ? ` - ${json.message}` : ""}`);
    return json;
};

const geoJsonToLatLngs = (geometry: { coordinates: [number, number][] }): [number, number][] =>
    geometry.coordinates.map(([lng, lat]) => [lat, lng]);

/**
 * Orders the stops and returns the road geometry for a round trip that starts
 * and ends at `startPoint`. Uses OSRM's trip service (a TSP heuristic on the
 * real road network) when the stop count is within the server limit, and
 * falls back to nearest-neighbour ordering plus a plain route request otherwise.
 */
export const calculateRoadRoute = async <T extends RoutePoint>(
    startPoint: Coordinates,
    points: T[],
    signal?: AbortSignal
): Promise<RoadRoute<T>> => {
    if (points.length === 0) {
        return { order: [], geometry: [], distanceKm: 0, durationMin: 0, legs: [] };
    }

    if (points.length + 1 <= OSRM_MAX_TRIP_POINTS) {
        const coords = toCoordString([startPoint, ...points]);
        const json = await fetchOsrm(
            `/trip/v1/driving/${coords}?source=first&roundtrip=true&overview=full&geometries=geojson`,
            signal
        );
        const trip = json.trips?.[0];
        if (!trip) throw new Error("OSRM returned no trip");

        // waypoints[i] corresponds to input coordinate i; waypoint_index is its position in the trip.
        const ordered: { point: T; index: number }[] = [];
        (json.waypoints as { waypoint_index: number }[]).forEach((wp, inputIdx) => {
            if (inputIdx === 0) return; // start point
            ordered.push({ point: points[inputIdx - 1], index: wp.waypoint_index });
        });
        ordered.sort((a, b) => a.index - b.index);

        return {
            order: ordered.map((o) => o.point),
            geometry: geoJsonToLatLngs(trip.geometry),
            distanceKm: trip.distance / 1000,
            durationMin: trip.duration / 60,
            legs: (trip.legs as { distance: number; duration: number }[]).map((l) => ({
                distanceKm: l.distance / 1000,
                durationMin: l.duration / 60,
            })),
        };
    }

    // Too many stops for the trip service: order locally, then fetch road geometry in chunks.
    const order = calculateNearestNeighborRoute(startPoint, points);
    const road = await fetchRoadGeometry([startPoint, ...order, startPoint], signal);
    return { order, ...road };
};

/**
 * Fetches road geometry through the given ordered waypoints. Splits the
 * request into chunks so very long itineraries stay within URL length limits.
 */
export const fetchRoadGeometry = async (
    waypoints: Coordinates[],
    signal?: AbortSignal
): Promise<Omit<RoadRoute, "order">> => {
    const CHUNK = 50;
    const geometry: [number, number][] = [];
    const legs: { distanceKm: number; durationMin: number }[] = [];
    let distanceKm = 0;
    let durationMin = 0;

    for (let i = 0; i < waypoints.length - 1; i += CHUNK - 1) {
        const slice = waypoints.slice(i, i + CHUNK);
        if (slice.length < 2) break;
        const json = await fetchOsrm(
            `/route/v1/driving/${toCoordString(slice)}?overview=full&geometries=geojson`,
            signal
        );
        const route = json.routes?.[0];
        if (!route) throw new Error("OSRM returned no route");
        const part = geoJsonToLatLngs(route.geometry);
        geometry.push(...(geometry.length ? part.slice(1) : part));
        distanceKm += route.distance / 1000;
        durationMin += route.duration / 60;
        (route.legs as { distance: number; duration: number }[]).forEach((l) =>
            legs.push({ distanceKm: l.distance / 1000, durationMin: l.duration / 60 })
        );
    }

    return { geometry, distanceKm, durationMin, legs };
};

/** Resolves the browser's current position, or rejects if unavailable/denied. */
export const getCurrentPosition = (timeoutMs = 10000): Promise<Coordinates> =>
    new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(new Error(err.message || "Could not determine your location")),
            { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 }
        );
    });

export const formatDistanceKm = (km: number): string =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;

export const formatDurationMin = (min: number): string => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
};
