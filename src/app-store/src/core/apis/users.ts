import axios from 'axios';
import { LoginCredentials } from '@/app/types/users';
import { getApiBaseUrl } from '@/lib/envConstants';
import createSecureApiClient from '@/core/utils/secureApiProxyClient';

export const users = {
  loginWithDetails: async (data: LoginCredentials) => {
    const apiUrl = getApiBaseUrl();
    const response = await axios.post(`${apiUrl}/users/login-with-details`, data, {
      timeout: 15000,
    });
    return response.data;
  },
  getUserDetails: async (userId: string) => {
    const response = await createSecureApiClient().get(`/users/${userId}`, {
      headers: { 'X-Auth-Type': 'JWT' },
    });
    return response.data;
  },
};
