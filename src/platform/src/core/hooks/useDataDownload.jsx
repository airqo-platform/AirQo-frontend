import axios from 'axios';
import { exportDataApi } from '../apis/Analytics';

const useDataDownload = () => {
  const isDev =
    typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
  const apiUrl = '/api/proxy/data-download';

  const fetchData = async (data) => {
    if (typeof window === 'undefined') {
      throw new Error('`localStorage` is not available in this environment');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token missing');
    }

    try {
      if (isDev) {
        // Dev: Axios directly
        const response = await axios.post(apiUrl, data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });
        return response.data;
      } else {
        // Prod: your API wrapper
        const response = await exportDataApi(data);
        return response;
      }
    } catch (error) {
      // NEW: catch a 404 and throw our custom message
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'We couldn’t find any data for that time range. Please try different dates.',
        );
      }

      // fall back to your existing behavior
      throw new Error(
        error.response?.data?.message || 'Error while fetching data',
      );
    }
  };

  return fetchData;
};

export default useDataDownload;
