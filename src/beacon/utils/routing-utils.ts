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
// Straight-line route optimisation, used while road routing is switched off.
// Visiting every stop once and returning is the Travelling Salesman Problem;
// it is solved here with nearest-neighbour ordering improved by 2-opt.
// ---------------------------------------------------------------------------

export interface StraightLineRoute<T extends RoutePoint = RoutePoint> {
    /** Stops in visiting order (start/end point excluded). */
    order: T[];
    /** Total straight-line distance in kilometres, back to the start included. */
    distanceKm: number;
    /** Straight-line distance of each leg, index i = leg leaving stop i (or the start for i = 0). */
    legs: { distanceKm: number }[];
}

const straightKm = (a: Coordinates, b: Coordinates): number =>
    haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);

/**
 * A short round trip from `startPoint` through every stop. Nearest-neighbour gives a first tour;
 * 2-opt then reverses any stretch of it whose reversal shortens the trip, until none does (or
 * `maxPasses` runs out), which removes the crossings and backtracks nearest-neighbour leaves.
 */
export const optimizeRoundTrip = <T extends RoutePoint>(
    startPoint: Coordinates,
    points: T[],
    maxPasses = 50
): StraightLineRoute<T> => {
    if (points.length === 0) return { order: [], distanceKm: 0, legs: [] };

    // Node 0 is the start; the tour is 0 → stops → 0
    const nodes: Coordinates[] = [startPoint, ...calculateNearestNeighborRoute(startPoint, points)];
    const n = nodes.length;
    const dist = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const d = straightKm(nodes[i], nodes[j]);
            dist[i * n + j] = d;
            dist[j * n + i] = d;
        }
    }
    const tour = [...Array.from({ length: n }, (_, i) => i), 0];
    const d = (a: number, b: number) => dist[a * n + b];

    for (let pass = 0, improved = true; improved && pass < maxPasses; pass++) {
        improved = false;
        for (let i = 1; i < tour.length - 2; i++) {
            for (let k = i + 1; k < tour.length - 1; k++) {
                const delta =
                    d(tour[i - 1], tour[k]) + d(tour[i], tour[k + 1]) - d(tour[i - 1], tour[i]) - d(tour[k], tour[k + 1]);
                if (delta < -1e-9) {
                    for (let lo = i, hi = k; lo < hi; lo++, hi--) [tour[lo], tour[hi]] = [tour[hi], tour[lo]];
                    improved = true;
                }
            }
        }
    }

    const legs = tour.slice(1).map((node, idx) => ({ distanceKm: d(tour[idx], node) }));
    return {
        order: tour.slice(1, -1).map((node) => nodes[node] as T),
        distanceKm: legs.reduce((sum, leg) => sum + leg.distanceKm, 0),
        legs,
    };
};

/**
 * The extra distance of also visiting `candidate`: the cheapest leg a → b of the round trip
 * (start, stops…, start) to slot it into, costing d(a, c) + d(c, b) − d(a, b).
 */
export const cheapestInsertionKm = (
    startPoint: Coordinates,
    stops: Coordinates[],
    candidate: Coordinates
): number => {
    const tour = [startPoint, ...stops, startPoint];
    let best = Infinity;
    for (let i = 0; i < tour.length - 1; i++) {
        const extra = straightKm(tour[i], candidate) + straightKm(candidate, tour[i + 1]) - straightKm(tour[i], tour[i + 1]);
        if (extra < best) best = extra;
    }
    return Math.max(0, best);
};

/**
 * Google Maps takes at most nine waypoints between a link's origin and destination, and three in
 * a phone's web browser, see https://developers.google.com/maps/documentation/urls/get-started.
 */
export const GOOGLE_MAPS_MAX_WAYPOINTS = 9;
export const GOOGLE_MAPS_PHONE_MAX_WAYPOINTS = 3;

/**
 * Whether this is a phone or tablet browser, whose Google Maps links take fewer waypoints. An
 * iPad asking for desktop sites sends a Mac user agent, so it is told from a Mac by its touch
 * points: a Mac reports none.
 */
export const isPhoneBrowser = (
    userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
    maxTouchPoints: number = typeof navigator !== "undefined" ? navigator.maxTouchPoints ?? 0 : 0
): boolean =>
    /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);

export interface GoogleMapsLink {
    url: string;
    /** 1-based positions in `points` this link covers, first and last included */
    from: number;
    to: number;
}

const latLng = (p: Coordinates) => `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}`;

/**
 * Driving directions through `points` in order, as Google Maps links. A trip with more stops than
 * one link takes is split into consecutive links, each starting where the previous one ended.
 */
export const buildGoogleMapsDirectionsLinks = (
    points: Coordinates[],
    maxWaypoints: number = GOOGLE_MAPS_MAX_WAYPOINTS
): GoogleMapsLink[] => {
    if (points.length < 2) return [];
    const perLink = maxWaypoints + 1; // legs per link: origin, waypoints, destination
    const links: GoogleMapsLink[] = [];
    for (let i = 0; i < points.length - 1; i += perLink) {
        const slice = points.slice(i, i + perLink + 1);
        const params = new URLSearchParams({
            api: "1",
            origin: latLng(slice[0]),
            destination: latLng(slice[slice.length - 1]),
            travelmode: "driving",
        });
        const waypoints = slice.slice(1, -1);
        if (waypoints.length > 0) params.set("waypoints", waypoints.map(latLng).join("|"));
        links.push({ url: `https://www.google.com/maps/dir/?${params.toString()}`, from: i + 1, to: i + slice.length });
    }
    return links;
};

// ---------------------------------------------------------------------------
// Road-network routing (OSRM public demo server, free, no API key required).
// See https://project-osrm.org/docs/v5.24.0/api/ for the HTTP API.
// The demo server is rate-limited and intended for light use; a self-hosted
// OSRM instance can be pointed to via NEXT_PUBLIC_OSRM_BASE_URL.
// ---------------------------------------------------------------------------

/**
 * Road routing (OSRM) is off until NEXT_PUBLIC_ENABLE_ROAD_ROUTING=true; meanwhile routes are
 * optimised on straight-line distances and no stop coordinates go to OSRM. Google Maps links
 * carry the stop coordinates either way, when they are opened, copied or shared.
 */
export const ROAD_ROUTING_ENABLED =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_ROAD_ROUTING === "true";

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
    /** How the stops were put in order: OSRM's trip service, or nearest-neighbour past its limit */
    planner: "osrm-trip" | "nearest-neighbour";
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
        return { order: [], geometry: [], distanceKm: 0, durationMin: 0, legs: [], planner: "osrm-trip" };
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
            planner: "osrm-trip",
        };
    }

    // Too many stops for the trip service: order locally, then fetch road geometry in chunks.
    const order = calculateNearestNeighborRoute(startPoint, points);
    const road = await fetchRoadGeometry([startPoint, ...order, startPoint], signal);
    return { order, ...road, planner: "nearest-neighbour" };
};

/**
 * Fetches road geometry through the given ordered waypoints. Splits the
 * request into chunks so very long itineraries stay within URL length limits.
 */
export const fetchRoadGeometry = async (
    waypoints: Coordinates[],
    signal?: AbortSignal
): Promise<Omit<RoadRoute, "order" | "planner">> => {
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
