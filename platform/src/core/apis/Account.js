import { data } from 'autoprefixer';
import { AUTH_URL, GOOGLE_AUTH_URL, LOGIN_URL, USERS_URL } from '../urls/authentication';
import axios from 'axios';

let jwtToken;
if (typeof window !== 'undefined') {
  jwtToken = window.localStorage.getItem('token');
}
axios.defaults.headers.common.Authorization = jwtToken;

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

export const getUserDetails = async (userID) => {
  return await axios.get(`${USERS_URL}/${userID}`).then((response) => response.data);
};
