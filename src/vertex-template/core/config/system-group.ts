import { vertexConfig } from "@/vertex.config";

/**
 * The "system group" is the operator's own umbrella organization (for
 * example "airqo" in an AirQo deployment). Members of this group get the
 * internal/staff experience: unscoped device and site listings, personal
 * workspace semantics, and the system network sorted first.
 *
 * Configured via auth.systemGroupSlug in vertex.config.ts.
 */
export const SYSTEM_GROUP_SLUG = (
  vertexConfig.auth.systemGroupSlug ?? "system"
).toLowerCase();

export const isSystemGroupTitle = (title?: string | null): boolean =>
  !!title && title.toLowerCase() === SYSTEM_GROUP_SLUG;

export const isSystemNetworkName = (name?: string | null): boolean =>
  !!name && name.toLowerCase() === SYSTEM_GROUP_SLUG;
