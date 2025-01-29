import createAxiosInstance from "./axiosConfig";
import { AxiosResponse } from "axios";
import { USERS_MGT_URL} from "@/core/urls";
import { Client, AccessToken } from "@/app/types/clients";
import { UserDetails } from "@/app/types/users";

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

export const updateUserPasswordApi = async (
  userId: string,
  tenant: string,
  userData: UserDetails
): Promise<UserDetails> => {
  return await axiosInstance.put(`${USERS_MGT_URL}/updatePassword`, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};


export const updateClientApi = async (
  data: CreateClientData,
  client_id: string
): Promise<Client> => {
  return await createAxiosInstance()
    .put(`${USERS_MGT_URL}/clients/${client_id}`, data)
    .then((response) => response.data);
};

export const generateTokenApi = async (data: Client): Promise<Client> => {
  const response = await axiosInstance.post(`${USERS_MGT_URL}/token`, data);
  return response.data;
};

export const getClientsApi = async () => {
  return axiosInstance.get(`${USERS_MGT_URL}/clients`).then((response) => response.data);
};

export const activateUserClientApi = async (data: { _id: string; isActive: boolean }) => {
  return axiosInstance
    .put(`${USERS_MGT_URL}/clients/activate`, data)
    .then((response) => response.data);
};


// export const activateUserClientApi = async (data: ActivationData): Promise<any> => {
//   return await createAxiosInstance()
//     .post(`${USERS_MGT_URL}/clients/activate/${data._id}`, data)
//     .then((response) => response.data);
// };

export const activationRequestApi = async (clientID: string): Promise<Client> => {
  return await axiosInstance.get(`${USERS_MGT_URL}/clients/activate-request/${clientID}`)
    .then((response) => response.data);
};