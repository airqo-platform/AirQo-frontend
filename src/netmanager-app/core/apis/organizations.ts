import createAxiosInstance from "./axiosConfig";
import { USERS_MGT_URL, DEVICES_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import { Group } from "@/app/types/groups";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const groupsApi = {
  getGroupsApi: async () => {
    try {
      const response = await axiosInstance.get(`${USERS_MGT_URL}/groups/summary`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch groups summary");
    }
  },

  getGroupDetailsApi: async (groupId: string) => {
    try {
      const response = await axiosInstance.get(`${USERS_MGT_URL}/groups/${groupId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch group details");
    }
  },

  updateGroupDetailsApi: async (groupId: string, data: Partial<Group>) => {
    try {
      const response = await axiosInstance.put(`${USERS_MGT_URL}/groups/${groupId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to update group details");
    }
  },

  createGroupApi: async (data: Group) => {
    try {
      const response = await axiosInstance.post(`${USERS_MGT_URL}/groups`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to create group");
    }
  },

  assignDevicesToGroupApi: async (deviceIds: string[], groups: string[]) => {
    try {
      const response = await axiosInstance.put(`${DEVICES_MGT_URL}/bulk`, {
        deviceIds,
        updateData: { groups },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to assign devices to group");
    }
  },

  assignSitesToGroupApi: async (siteIds: string[], groups: string[]) => {
    try {
      const response = await axiosInstance.put(`${DEVICES_MGT_URL}/sites/bulk`, {
        siteIds,
        updateData: { groups },
      });
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
      const response = await axiosInstance.get(`${USERS_MGT_URL}/groups/${groupId}/assigned-users`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch group members");
    }
  },

  inviteUserToGroupTeam: async (groupId: string, userEmail: string) => {
    try {
      const response = await axiosInstance.post(`${USERS_MGT_URL}/requests/emails/groups/${groupId}`, { emails: [userEmail] });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to send invitation");
    }
  },

  acceptGroupTeamInvite: async (groupId: string, userEmail: string) => {
    try {
      const response = await axiosInstance.post(`${USERS_MGT_URL}/requests/emails/groups/${groupId}/accept`, { email: userEmail });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to accept invitation");
    }
  },

  updateGroupTeam: async (groupId: string, userEmail: string, role: string) => {
    try {
      const response = await axiosInstance.put(`${USERS_MGT_URL}/groups/${groupId}/members/${userEmail}`, { role });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Failed to update team member");
    }
  },
};
