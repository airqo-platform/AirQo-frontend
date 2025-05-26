import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import { INQUIRY_URL } from '../urls/inquiry';

// Register new inquiry
export const registerInquiry = (body) =>
  secureApiProxy
    .post(`${INQUIRY_URL}/register`, body, { authType: AUTH_TYPES.NONE })
    .then((response) => response.data);
