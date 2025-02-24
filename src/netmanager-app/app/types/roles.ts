export interface Permission {
    _id: string;
    permission: string;
  }
  
export interface Group {
    _id: string;
    grp_status: string;
    grp_profile_picture: string;
    grp_title: string;
    grp_description: string;
    grp_website: string;
    grp_industry: string;
    grp_country: string;
    grp_timezone: string;
    grp_manager: string;
    grp_manager_username: string;
    grp_manager_firstname: string;
    grp_manager_lastname: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
export interface Role {
    _id: string;
    role_status: string;
    role_name: string;
    role_permissions: Permission[];
    group?: Group;
  }
  
export interface RolesResponse {
    success: boolean;
    message: string;
    roles: Role[];
  }
  