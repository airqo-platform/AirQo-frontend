import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";
import { Group } from "@/app/types/groups";

interface ErrorResponse {
  message: string;
}

interface CreateOrgInput {
  grp_title: string;
  grp_country: string;
  grp_industry: string;
  grp_timezone: {
    value: string;
    label: string;
  };
  grp_description: string;
  grp_website: string;
  grp_profile_picture?: string | "";
};


export const groupsApi = {
  getGroupsApi: async () => {
    try {
      const response = await createSecureApiClient().get(`/users/groups/summary`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch groups summary");
    }
  },

  getGroupDetailsApi: async (groupId: string) => {
    try {
      const response = await createSecureApiClient().get(`/users/groups/${groupId}`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch group details");
    }
  },

  updateGroupDetailsApi: async (groupId: string, data: Partial<Group>) => {
    try {
      const response = await createSecureApiClient().put(`/users/groups/${groupId}`, data, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to update group details");
    }
  },

  createGroupApi: async (data: CreateOrgInput) => {
    try {
      const response = await createSecureApiClient().post(`/users/groups`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to create group");
    }
  },

  assignDevicesToGroupApi: async (deviceIds: string[], groups: string[]) => {
    try {
      const response = await createSecureApiClient().put(`/devices/bulk`, {
        deviceIds,
        updateData: { groups },
      }, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to assign devices to group");
    }
  },

  assignSitesToGroupApi: async (siteIds: string[], groups: string[]) => {
    try {
      const response = await createSecureApiClient().put(`/devices/sites/bulk`, {
        siteIds,
        updateData: { groups },
      }, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to assign sites to group");
    }
  },
};

export const groupMembers = {
  getGroupMembersApi: async (groupId: string) => {
    try {
      const response = await createSecureApiClient().get(`/users/groups/${groupId}/assigned-users`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch group members");
    }
  },

  inviteUserToGroupTeam: async (groupId: string, userEmail: string) => {
    try {
      const response = await createSecureApiClient().post(`/users/requests/emails/groups/${groupId}`, { emails: [userEmail] }, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to send invitation");
    }
  },

  acceptGroupTeamInvite: async (groupId: string, userEmail: string) => {
    try {
      const response = await createSecureApiClient().post(`/users/requests/emails/groups/${groupId}/accept`, { email: userEmail }, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to accept invitation");
    }
  },

  updateGroupTeam: async (groupId: string, userEmail: string, role: string) => {
    try {
      const response = await createSecureApiClient().put(`/users/groups/${groupId}/members/${userEmail}`, { role }, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to update team member");
    }
  },
};
