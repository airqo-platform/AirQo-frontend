import createSecureApiClient from "../utils/secureApiProxyClient";

export const getClientsApi = async () => {
  return createSecureApiClient().get(`/users/clients`, {
    headers: { 'X-Auth-Type': 'JWT' }
  }).then((response) => response.data);
};

export const activateUserClientApi = async (data: { _id: string; isActive: boolean }) => {
  return createSecureApiClient()
    .put(`/users/clients/activate`, data, {
      headers: { 'X-Auth-Type': 'JWT' }
    })
    .then((response) => response.data);
};
