import { api } from '../utils/apiClient';
import { INQUIRY_URL } from '../urls/inquiry';

// Register new inquiry
export const registerInquiry = (body) =>
  api.post(`${INQUIRY_URL}/register`, body).then((response) => response.data);
