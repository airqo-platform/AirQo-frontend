export interface Permission {
  _id: string;
  permission: string;
  network_id?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  _id: string;
  role_name: string;
  role_permissions: Permission[];
}

export interface Network {
  net_name: string;
  _id: string;
  role: Role;
  userType: string;
  createdAt?: string;
  status?: string;
}

export interface Client {
  _id: string;
  name: string;
  user_id: string;
  client_secret: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Group {
  grp_title: string;
  _id: string;
  createdAt: string;
  status: string;
  role: Role;
  userType: string;
}

export interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  lastLogin: string;
  isActive: boolean;
  loginCount: number;
  userName: string;
  email: string;
  verified: boolean;
  analyticsVersion: number;
  country: string | null;
  privilege: string;
  website: string | null;
  category: string | null;
  organization: string;
  long_organization: string;
  rateLimit: number | null;
  jobTitle: string | null;
  description: string | null;
  profilePicture: string | null;
  phoneNumber: string | null;
  updatedAt: string;
  networks: Network[];
  clients: Client[];
  groups: Group[];
  permissions: Permission[];
  createdAt: string;
  my_networks: string[];
  my_groups: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  users: UserDetails[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export interface CurrentRole {
  role_name: string;
  permissions: string[];
}
