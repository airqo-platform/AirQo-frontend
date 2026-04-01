export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  _id: string;
  userName: string;
  email: string;
}

export interface DecodedToken {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  organization: string;
  privilege: string;
  country?: string | null;
  timezone?: string | null;
  phoneNumber?: string | null;
  exp?: number;
}