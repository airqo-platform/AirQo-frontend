import createAxiosInstance from "./axiosConfig";
import { EXPORT_DATA_URL } from "@/core/urls";
import { FormData } from "@/types/export";

const axiosInstance = createAxiosInstance();

export const dataExport = async (data: any) => {
    try {
        const headers = {
            service: 'data-export'
        }
        const exportData =  axiosInstance.post(`${EXPORT_DATA_URL}`, data, { headers });
        return exportData;
    } catch (error) {
        throw error;
    }
};