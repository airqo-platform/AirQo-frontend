export default function normalizeLocation(raw) {
  return {
    description: raw.description,
    search_name: raw.search_name,
    location: raw.location,
    place_id: raw.place_id,
    latitude: raw.geometry?.coordinates?.[1] ?? raw.approximate_latitude,
    longitude: raw.geometry?.coordinates?.[0] ?? raw.approximate_longitude,
    ...raw,
  };
}
