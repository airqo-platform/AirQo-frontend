import createAxiosInstance from "./axiosConfig";
import { ANALYTICS_MGT_URL, USERS_MGT_URL } from "@/core/urls";

const axiosInstance = createAxiosInstance();

interface DataExportForm {
  startDateTime: string;
  endDateTime: string;
  sites?: string[] | [];
  device_names?: string[] | [];
  datatype: "raw" | "calibrated";
  frequency: "daily" | "hourly" | "monthly" | "weekly";
  pollutants?: string[];
  downloadType: "csv" | "json";
  outputFormat: "airqo-standard";
  minimum?: true;
}

export const dataExport = async (data: DataExportForm) => {
  const headers = {
    service: "data-export",
  };
  return axiosInstance.post<{ downloadUrl: string }>(
    `${ANALYTICS_MGT_URL}/data-download`,
    data,
    { headers }
  );
};

export const getClientsApi = async () => {
  return axiosInstance.get(`${USERS_MGT_URL}/clients`).then((response) => response.data);
};

export const activateUserClientApi = async (data: { _id: string; isActive: boolean }) => {
  return axiosInstance
    .put(`${USERS_MGT_URL}/clients/activate`, data)
    .then((response) => response.data);
};
