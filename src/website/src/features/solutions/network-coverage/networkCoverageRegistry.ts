export type NetworkCoverageRegistrationAvailability =
  | 'available'
  | 'pending'
  | null;

export interface NetworkCoverageRegistrationResult {
  monitorId: string | null;
  countryId: string | null;
  iso2: string | null;
  availability: NetworkCoverageRegistrationAvailability;
}

const readField = (response: unknown, keys: string[]): string | null => {
  const visited = new Set<object>();

  const read = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null;
    if (visited.has(value)) return null;
    visited.add(value);

    const record = value as Record<string, unknown>;
    for (const key of keys) {
      const field = record[key];
      if (typeof field === 'string' && field.trim()) return field.trim();
      if (field && typeof field === 'object') {
        const nested = read(field);
        if (nested) return nested;
      }
    }

    for (const key of ['registry', 'monitor', 'data', 'result', 'item']) {
      const nested = read(record[key]);
      if (nested) return nested;
    }

    return null;
  };

  return read(response);
};

/**
 * Registry responses have existed in more than one envelope shape across the
 * network-coverage API. Prefer the backend's stable monitorId over a registry
 * record _id because site-linked entries are read by the Site ID.
 */
export const extractNetworkCoverageMonitorId = (
  response: unknown,
): string | null => {
  const visited = new Set<object>();

  const read = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (!value || typeof value !== 'object') return null;
    if (visited.has(value)) return null;
    visited.add(value);

    const record = value as Record<string, unknown>;
    const objectId = record.$oid;
    if (typeof objectId === 'string' && objectId.trim()) return objectId.trim();

    for (const key of ['monitorId', 'monitor_id', 'site_id', 'id', '_id']) {
      const id = read(record[key]);
      if (id) return id;
    }

    for (const key of ['registry', 'monitor', 'data', 'result', 'item']) {
      const id = read(record[key]);
      if (id) return id;
    }

    return null;
  };

  return read(response);
};

export const extractNetworkCoverageRegistration = (
  response: unknown,
): NetworkCoverageRegistrationResult => {
  const availabilityValue = readField(response, [
    'availability',
  ])?.toLowerCase();

  return {
    monitorId: extractNetworkCoverageMonitorId(response),
    countryId: readField(response, ['countryId', 'country_id']),
    iso2: readField(response, ['iso2']),
    availability:
      availabilityValue === 'available' || availabilityValue === 'pending'
        ? availabilityValue
        : null,
  };
};
