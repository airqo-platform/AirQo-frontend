import createAxiosInstance from "./axiosConfig";
import { ANALYTICS_MGT_URL } from "@/core/urls";

const axiosInstance = createAxiosInstance();

export const dataExport = async (data: any) => {
    try {
        const headers = {
            service: 'data-export'
        }
        const exportData =  axiosInstance.post(`${ANALYTICS_MGT_URL}/data-download`, data, { headers });
        return exportData;
    } catch (error) {
        throw error;
    }
};