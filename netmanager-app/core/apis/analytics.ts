import createAxiosInstance from "./axiosConfig";
import { ANALYTICS_MGT_URL } from "@/core/urls";

const axiosInstance = createAxiosInstance();

export const dataExport = async (data: FormData) => {  

        const headers = {
            service: 'data-export'
        }
        return axiosInstance.post<{ downloadUrl: string }>(  
           `${ANALYTICS_MGT_URL}/data-download`,
            data,
            { headers }
        );
};