import createAxiosInstance from "./axiosConfig";
import { USERS_MGT_URL} from "@/core/urls";
import { Client } from "@/app/types/clients";

const axiosInstance = createAxiosInstance();

export const getUserClientsApi = async (userID: string): Promise<Client[]> => {
    try {
      const response = await axiosInstance.get<Client[]>(USERS_MGT_URL, {
        params: { user_id: userID },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
};