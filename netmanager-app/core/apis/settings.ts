import createAxiosInstance from "./axiosConfig";
import { AxiosResponse } from "axios";
import { USERS_MGT_URL} from "@/core/urls";
import { Client } from "@/app/types/clients";

interface CreateClientData {
  name: string;
  ip_addresses: string[];
  isActive: boolean;
  client_secret: string;
  user_id: string;
}

const axiosInstance = createAxiosInstance();

export const getUserClientsApi = async (userID: string): Promise<Client[]> => {
    try {
      const response = await axiosInstance.get<Client[]>(`${USERS_MGT_URL}/clients`, {
        params: { user_id: userID },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
};

export const createClientApi = async (data: CreateClientData): Promise<Client> => {
  return await axiosInstance.post<CreateClientData, AxiosResponse<Client>>(`${USERS_MGT_URL}/clients`, data)
    .then((response) => response.data);
};