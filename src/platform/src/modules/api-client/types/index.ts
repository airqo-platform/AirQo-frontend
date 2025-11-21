export interface Client {
  _id: string;
  isActive: boolean;
  ip_addresses: string[];
  name: string;
  client_secret: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    loginCount: number;
    preferredTokenStrategy?: string;
    phoneNumber?: number;
    theme?: {
      primaryColor: string;
      mode: string;
      interfaceStyle: string;
      contentLayout: string;
    };
  };
  access_token?: {
    _id: string;
    permissions: string[];
    scopes: string[];
    expiredEmailSent: boolean;
    token: string;
    client_id: string;
    name: string;
    expires: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface CreateClientData {
  name: string;
  user_id?: string;
  ip_addresses?: string[];
}

export interface UpdateClientData {
  name?: string;
  ip_addresses?: string[];
}

export interface GenerateTokenData {
  name: string;
  client_id: string;
}
