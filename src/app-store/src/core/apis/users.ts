import axios from 'axios';
import { LoginCredentials } from '@/app/types/users';
import { getApiBaseUrl } from '@/lib/envConstants';

export const users = {
  loginWithDetails: async (data: LoginCredentials) => {
    const apiUrl = getApiBaseUrl();
    const response = await axios.post(`${apiUrl}/users/login-with-details`, data, {
      timeout: 15000,
    });
    return response.data;
  },
};