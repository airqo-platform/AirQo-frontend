import createAxiosInstance from "./axiosConfig";
import { ANALYTICS_MGT_URL } from "@/core/urls";

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
