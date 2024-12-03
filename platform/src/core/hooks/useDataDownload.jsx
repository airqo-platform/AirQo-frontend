import axios from 'axios';

import { exportDataApi } from '../apis/Analytics';

const useDataDownload = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const apiUrl = '/api/proxy/data-download';

  const fetchData = async (data) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Authorization token missing');
    }

    try {
      if (isDev) {
        // Use proxy endpoint in development
        const response = await axios.post(apiUrl, data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });
        return response.data;
      } else {
        // Use exportDataApi in production
        const response = await exportDataApi(data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error(
        error.response?.data?.message || 'Error while fetching data',
      );
    }
  };

  return fetchData;
};

export default useDataDownload;
