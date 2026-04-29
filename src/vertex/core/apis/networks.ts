import createSecureApiClient from "@/core/utils/secureApiProxyClient";

export interface NetworkManager {
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

export interface NetworkRole {
  _id: string;
  role_name: string;
}

export interface Network {
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
  net_manager: NetworkManager;
  net_users: any[];
  net_permissions: any[];
  net_roles: NetworkRole[];
  net_departments: any[];
}

export interface NetworksSummaryResponse {
  success: boolean;
  message: string;
  networks: Network[];
}

export interface CreateNetworkPayload {
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

export interface CreateNetworkResponse {
  success: boolean;
  message: string;
  created_network: Network;
}

export interface NetworkCreationRequest {
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

export interface NetworkCreationRequestsResponse {
  success: boolean;
  message: string;
  network_creation_requests: NetworkCreationRequest[];
}

export interface NetworkRequestActionResponse {
  success: boolean;
  message: string;
  data: any;
}

export const networks = {
  getNetworksApi: async (): Promise<Network[]> => {
    try {
      const response = await createSecureApiClient().get<NetworksSummaryResponse>(
        `/users/networks`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data.networks || [];
    } catch (error) {
      throw error;
    }
  },
};