import createAxiosInstance from "./axiosConfig";
import {  USERS_MGT_URL } from "@/core/urls";

const axiosInstance = createAxiosInstance();

export const getClientsApi = async () => {
  return axiosInstance.get(`${USERS_MGT_URL}/clients`).then((response) => response.data);
};

export const activateUserClientApi = async (data: { _id: string; isActive: boolean }) => {
  return axiosInstance
    .put(`${USERS_MGT_URL}/clients/activate`, data)
    .then((response) => response.data);
};
