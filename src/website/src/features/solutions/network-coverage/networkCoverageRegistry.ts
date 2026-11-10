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
  const identifierWrappers = ['registry', 'monitor', 'data', 'result', 'item'];

  const readCandidate = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (!value || typeof value !== 'object') return null;

    const objectId = (value as Record<string, unknown>).$oid;
    return typeof objectId === 'string' && objectId.trim()
      ? objectId.trim()
      : null;
  };

  const findIdentifier = (keys: string[]): string | null => {
    const visited = new Set<object>();

    const find = (value: unknown): string | null => {
      if (!value || typeof value !== 'object') return null;
      if (visited.has(value)) return null;
      visited.add(value);

      if (Array.isArray(value)) {
        for (const item of value) {
          const identifier = find(item);
          if (identifier) return identifier;
        }
        return null;
      }

      const record = value as Record<string, unknown>;
      for (const key of keys) {
        const identifier = readCandidate(record[key]);
        if (identifier) return identifier;
      }

      for (const key of identifierWrappers) {
        const identifier = find(record[key]);
        if (identifier) return identifier;
      }

      return null;
    };

    return find(response);
  };

  // Search the entire response envelope for the stable monitor/site ID before
  // falling back to the registry record's own database ID.
  return (
    findIdentifier(['monitorId', 'monitor_id', 'site_id']) ??
    findIdentifier(['id', '_id'])
  );
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

export const getNetworkCoverageRegistrationNotice = (
  availability: NetworkCoverageRegistrationAvailability,
): string | null =>
  availability === 'pending'
    ? 'Monitor saved. It will appear in coverage once a device is active.'
    : null;
