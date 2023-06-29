import { AUTH_URL, GOOGLE_AUTH_URL } from '../urls/authentication';
import axios from 'axios';

export const postUserCreationDetails = async (data) =>
  await axios.post(AUTH_URL, data).then((response) => response.data);

export const getGoogleAuthDetails = async () => {
  await axios.get(GOOGLE_AUTH_URL);
};
