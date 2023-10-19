import { AUTH_URL, GOOGLE_AUTH_URL, LOGIN_URL, BASE_AUTH_URL, UPDATE_USER_DETAILS_URL } from '../urls/authentication';
import axios from 'axios';
import { NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';

export const postUserCreationDetails = async (data) =>
  await axios.post(AUTH_URL, data).then((response) => response.data);

export const getGoogleAuthDetails = async () => {
  await axios.get(GOOGLE_AUTH_URL);
};

export const postUserLoginDetails = async (data) => {
  try {
    const response = await axios.post(LOGIN_URL, data)
    return response.data
  } catch (error) {
    return error;
  }
}

export const updateUserCreationDetails = async (data, identifier) => {
  await axios.put(`${UPDATE_USER_DETAILS_URL}/${identifier}?token=${NEXT_PUBLIC_API_TOKEN}`, data).then(response => response.data)
}
