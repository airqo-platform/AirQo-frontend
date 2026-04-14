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
