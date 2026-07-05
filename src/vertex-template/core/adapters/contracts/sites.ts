/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */

import { Site } from "@/app/types/sites";
import { PaginationMeta } from "@/app/types/devices";
import type { DeviceActivitiesResponse } from "./devices";

export interface SitesSummaryResponse {
  success: boolean;
  message: string;
  sites: Site[];
  meta: PaginationMeta;
  cache_generated_at?: string;
}

export interface GetSitesSummaryParams {
  network: string;
  group?: string;
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface SitesSummaryCountResponse {
  message: string;
  summary: {
    total_sites: number;
    operational: number;
    transmitting: number;
    not_transmitting: number;
    data_available: number;
  };
}

export interface CreateSiteResponse {
  success: boolean;
  message: string;
  site: Site;
}

export interface SiteRefreshResponse {
  success: boolean;
  message: string;
  site: Site;
}

export interface ApproximateCoordinatesResponse {
  success: boolean;
  message: string;
  approximate_coordinates: {
    approximate_latitude: number;
    approximate_longitude: number;
    approximate_distance_in_km?: number;
    bearing_in_radians?: number;
    provided_latitude?: number;
    provided_longitude?: number;
  };
}

export interface SiteDetailsResponse {
  message: string;
  data: Site;
}

export interface UpdateSiteRequest {
  name?: string;
  description?: string;
  network?: string;
  latitude?: string;
  longitude?: string;
  parish?: string;
  sub_county?: string;
  district?: string;
  region?: string;
  altitude?: string;
  search_name?: string;
  location_name?: string;
}

/** Deployment locations: listing, detail, creation, and metadata. */
export interface SiteAdapter {
  getSitesSummary(params: GetSitesSummaryParams, signal?: AbortSignal): Promise<SitesSummaryResponse>;
  getSitesByCohorts(params: { cohort_ids: string[]; limit?: number; skip?: number; search?: string; sortBy?: string; order?: "asc" | "desc"; network?: string; }, signal?: AbortSignal): Promise<SitesSummaryResponse>;
  getSitesByStatusApi(params: { status: string; limit?: number; skip?: number; search?: string; sortBy?: string; order?: "asc" | "desc"; network?: string; group?: string; }): Promise<SitesSummaryResponse>;
  createSite(data: { name: string; latitude: string; longitude: string; network: string; }): Promise<CreateSiteResponse>;
  getApproximateCoordinates(latitude: string, longitude: string): Promise<ApproximateCoordinatesResponse>;
  getSiteDetails(siteId: string): Promise<SiteDetailsResponse>;
  updateSiteDetails(siteId: string, data: UpdateSiteRequest): Promise<SiteDetailsResponse>;
  bulkUpdate(data: { siteIds: string[]; updateData: { groups?: string[] } }): Promise<any>;
  getSitesSummaryCount(params: { network?: string }): Promise<SitesSummaryCountResponse>;
  getSiteActivities(siteId: string, params?: { page?: number; limit?: number }): Promise<DeviceActivitiesResponse>;
  refreshSiteMetadata(siteId: string): Promise<SiteRefreshResponse>;
}
