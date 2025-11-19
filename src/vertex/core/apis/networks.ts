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
  net_phoneNumber: number;
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

export interface NetworksResponse {
  success: boolean;
  message: string;
  networks: Network[];
}

export const networks = {
  getNetworksApi: async (): Promise<Network[]> => {
    try {
      const response = await createSecureApiClient().get<NetworksResponse>(
        `/users/networks`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data.networks || [];
    } catch (error) {
      throw error;
    }
  },
};