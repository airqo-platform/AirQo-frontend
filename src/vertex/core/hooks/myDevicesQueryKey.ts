/**
 * True when two "myDevices" query keys describe the same set of devices and
 * differ only in which page of it was requested (the trailing limit/skip).
 *
 * Used to decide whether the previous page may stay on screen as placeholder
 * data: React Query reports placeholder data as loaded, so reusing it across a
 * different status would show the old rows and total under the new filter.
 */
export const isSameMyDevicesResultSet = (
  a: readonly unknown[],
  b: readonly unknown[]
): boolean => JSON.stringify(a.slice(0, -2)) === JSON.stringify(b.slice(0, -2));
