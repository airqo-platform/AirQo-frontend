export interface RolePermission {
  permission: string;
}

export interface Role {
  role_name: string;
  role_permissions?: RolePermission[];
}

export interface Group {
  _id: string;
  grp_title: string;
  role?: Role;
}

export interface Network {
  _id: string;
  net_name: string;
  role?: Role;
}

export interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  groups?: Group[];
  networks?: Network[];
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  users: UserDetails[];
}

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