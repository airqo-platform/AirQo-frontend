import axios from 'axios';
import { exportDataApi } from '../apis/Analytics';

const useDataDownload = () => {
  const fetchData = async (data) => {
    try {
      const response = await exportDataApi(data);
      return response;
    } catch (error) {
      // Specific error for 404 cases
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'We couldn’t find any data for that time range. Please try different dates.',
        );
      }

      // General error handling
      throw new Error(
        error.response?.data?.message || 'Error while fetching data',
      );
    }
  };

  return fetchData;
};

export default useDataDownload;
