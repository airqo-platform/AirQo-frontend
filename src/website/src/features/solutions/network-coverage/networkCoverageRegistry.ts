/**
 * Registry responses have existed in more than one envelope shape across the
 * network-coverage API. Resolve the stable monitor identifier without making
 * the page depend on one backend serializer.
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

    for (const key of ['id', '_id', 'monitorId', 'monitor_id', 'site_id']) {
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
