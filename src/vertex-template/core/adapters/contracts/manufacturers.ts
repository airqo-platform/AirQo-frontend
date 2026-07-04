/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */


export interface ManufacturerContact {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  group_roles: any[];
  isActive: boolean;
  lastLogin: string;
  verified: boolean;
  description: string;
  jobTitle: string | null;
  website: string;
  loginCount: number;
  analyticsVersion: number;
  preferredTokenStrategy: string;
}

export interface ManufacturerRole {
  _id: string;
  role_name: string;
}

export interface Manufacturer {
  _id: string;
  net_status: string;
  net_acronym: string;
  net_name: string;
  net_email: string;
  net_website: string;
  net_phoneNumber: number | string;
  net_category: string;
  net_description: string;
  net_profile_picture: string;
  createdAt: string;
  net_manager: ManufacturerContact;
  net_users: any[];
  net_permissions: any[];
  net_roles: ManufacturerRole[];
  net_departments: any[];
}

export interface ManufacturersSummaryResponse {
  success: boolean;
  message: string;
  networks: Manufacturer[];
}

export interface CreateManufacturerPayload {
  net_username: string;
  net_acronym: string;
  net_name: string;
  net_connection_endpoint: string;
  net_connection_string: string;
  net_email: string;
  net_website: string;
  admin_secret: string;
  net_phoneNumber: string;
  net_category: string;
  net_description: string;
}

export interface CreateManufacturerResponse {
  success: boolean;
  message: string;
  created_network: Manufacturer;
}

export interface ManufacturerCreationRequest {
  _id: string;
  requester_name: string;
  requester_email: string;
  net_name: string;
  net_email: string;
  net_website: string;
  net_category: string;
  net_description: string;
  net_acronym: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManufacturerCreationRequestsResponse {
  success: boolean;
  message: string;
  network_creation_requests: ManufacturerCreationRequest[];
}

export interface ManufacturerRequestActionResponse {
  success: boolean;
  message: string;
  data: any;
}

/** Sensor manufacturers — the entity historically called "network".
 * Wire-format field names (net_*) are kept for backend compatibility. */
export interface ManufacturerAdapter {
  getManufacturers(): Promise<Manufacturer[]>;
}

/** @deprecated Use the Manufacturer names; kept as aliases during the rename. */
export type Network = Manufacturer;
export type NetworkCreationRequest = ManufacturerCreationRequest;
export type CreateNetworkPayload = CreateManufacturerPayload;
export type CreateNetworkResponse = CreateManufacturerResponse;
