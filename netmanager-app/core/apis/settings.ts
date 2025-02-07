import createAxiosInstance from "./axiosConfig";
import { AxiosResponse } from "axios";
import { USERS_MGT_URL} from "@/core/urls";
import { Client } from "@/app/types/clients";
import { UserDetails } from "@/app/types/users";

interface CreateClientData {
  name: string;
  ip_addresses: string[];
  isActive: boolean;
  client_secret: string;
  user_id: string;
}

interface PasswordData {
  password: string;
  old_password: string;
}

const axiosInstance = createAxiosInstance();

export const settings = {
  getUserClientsApi: async (userID: string): Promise<Client[]> => {
    try {
      const response = await axiosInstance.get<Client[]>(`${USERS_MGT_URL}/clients`, {
        params: { user_id: userID },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  createClientApi: async (data: CreateClientData): Promise<Client> => {
    return await axiosInstance.post<CreateClientData, AxiosResponse<Client>>(`${USERS_MGT_URL}/clients`, data)
      .then((response) => response.data);
  },

  updateUserPasswordApi: async (
    userId: string,
    userData: PasswordData
  ): Promise<PasswordData> => {
    return await axiosInstance.put(`${USERS_MGT_URL}/updatePassword`, userData, {
      params: { id: userId },
    })
      .then((response) => response.data);
  },

  updateClientApi: async (
    data: CreateClientData,
    client_id: string
  ): Promise<Client> => {
    return await axiosInstance.put(`${USERS_MGT_URL}/clients/${client_id}`, data)
      .then((response) => response.data);
  },

  generateTokenApi: async (data: Client): Promise<Client> => {
    const client_id = data._id
    const formData = { client_id, name: data.name }
    const response = await axiosInstance.post(`${USERS_MGT_URL}/tokens`, formData);
    return response.data;
  },


  getClientsApi: async () => {
    return axiosInstance.get(`${USERS_MGT_URL}/clients`).then((response) => response.data);
  },

  activateUserClientApi: async (data: { _id: string; isActive: boolean }) => {
    return axiosInstance
      .post(`${USERS_MGT_URL}/clients/activate/${data._id}`, data)
      .then((response) => response.data);
  },

  activationRequestApi: async (clientID: string): Promise<Client> => {
    return await axiosInstance.get(`${USERS_MGT_URL}/clients/activate-request/${clientID}`)
      .then((response) => response.data);
  },

  updateUserDetailsApi: async (data: any, userID: string): Promise<UserDetails> => {
    return await axiosInstance.put(`${USERS_MGT_URL}/${userID}`, data)
      .then((response) => response.data);
  }
}
