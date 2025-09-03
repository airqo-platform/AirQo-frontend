import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosResponse } from "axios";
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

export const settings = {
  getUserClientsApi: async (userID: string) => {
      return await createSecureApiClient().get(`/users/clients`, {
        params: { user_id: userID },
        headers: { 'X-Auth-Type': 'JWT' }
      })
      .then((response) => response.data);
  },

  createClientApi: async (data: CreateClientData): Promise<Client> => {
    return await createSecureApiClient().post<CreateClientData, AxiosResponse<Client>>(`/users/clients`, data, {
      headers: { 'X-Auth-Type': 'JWT' }
    })
      .then((response) => response.data);
  },

  updateUserPasswordApi: async (
    userId: string,
    userData: PasswordData
  ): Promise<PasswordData> => {
    return await createSecureApiClient().put(`/users/updatePassword`, userData, {
      params: { id: userId },
      headers: { 'X-Auth-Type': 'JWT' }
    })
      .then((response) => response.data);
  },

  updateClientApi: async (
    data: CreateClientData,
    client_id: string
  ): Promise<Client> => {
    return await createSecureApiClient().put(`/users/clients/${client_id}`, data, {
      headers: { 'X-Auth-Type': 'JWT' }
    })
      .then((response) => response.data);
  },

  generateTokenApi: async (data: Client): Promise<Client> => {
    const client_id = data._id
    const formData = { client_id, name: data.name }
    const response = await createSecureApiClient().post(`/users/tokens`, formData, {
      headers: { 'X-Auth-Type': 'JWT' }
    });
    return response.data;
  },


  getClientsApi: async () => {
    return createSecureApiClient().get(`/users/clients`, {
      headers: { 'X-Auth-Type': 'JWT' }
    }).then((response) => response.data);
  },

  activateUserClientApi: async (data: { _id: string; isActive: boolean }) => {
    return createSecureApiClient()
      .post(`/users/clients/activate/${data._id}`, data, {
        headers: { 'X-Auth-Type': 'JWT' }
      })
      .then((response) => response.data);
  },

  activationRequestApi: async (clientID: string): Promise<Client> => {
    return await createSecureApiClient().get(`/users/clients/activate-request/${clientID}`, {
      headers: { 'X-Auth-Type': 'JWT' }
    })
      .then((response) => response.data);
  },

  updateUserDetailsApi: async (data: any, userID: string): Promise<UserDetails> => {
    return await createSecureApiClient().put(`/users/${userID}`, data, {
      headers: { 'X-Auth-Type': 'JWT' }
    })
      .then((response) => response.data);
  }
}
