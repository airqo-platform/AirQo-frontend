import createAxiosInstance from "./axiosConfig";
import { USERS_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import { Group } from "@/app/types/groups";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const groups = {
  getGroupsApi: async () => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/groups/summary`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grids summary"
      );
    }
  },
  getGroupDetailsApi: async (gridId: string) => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/groups/${gridId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grid details"
      );
    }
  },
  updateGroupDetailsApi: async (gridId: string, data: Group) => {
    try {
      const response = await axiosInstance.put(
        `${USERS_MGT_URL}/groups/${gridId}`, data
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update grid details"
      );
    }
  },
  createGroupApi: async (data: Group) => {
    try {
      const response = await axiosInstance.post(
        `${USERS_MGT_URL}/groups`,
        data
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create grid"
      );
    }
  },
};

export const groupMembers = {
  getGroupMembersApi: async (groupId: string) => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/groups/${groupId}/assigned-users`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch group members" 
      );
    }
  },

  inviteUserToGroupTeam: async (groupId: string, userEmail: string) => {
    try {
      const response = await axiosInstance.post(
        `${USERS_MGT_URL}/requests/emails/groups/${groupId}`,
        { emails: [userEmail] }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to send invitation" 
      );
    }
  },

  acceptGroupTeamInvite: async (groupId: string, userEmail: string) => {
    try {
      const response = await axiosInstance.post(
        `${USERS_MGT_URL}/requests/emails/groups/${groupId}`,
        { emails: [userEmail] }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to accept invitation" 
      );
    }
  },
}
