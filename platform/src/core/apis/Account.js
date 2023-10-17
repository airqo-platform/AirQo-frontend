import { AUTH_URL, GOOGLE_AUTH_URL, LOGIN_URL } from '../urls/authentication';
import axios from 'axios';

export const postUserCreationDetails = async (data) =>
  await axios.post(AUTH_URL, data).then((response) => response.data);

export const getGoogleAuthDetails = async () => {
  await axios.get(GOOGLE_AUTH_URL);
};

export const postUserLoginDetails = async (data) => {
  try {
    const response = await axios.post(LOGIN_URL, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting user login details: ${error}`);
    throw error;
  }
};
