import { UserDetails } from "@/app/types/users";

  export interface Group {
    _id: string
    grp_status: "ACTIVE" | "INACTIVE"
    grp_profile_picture: string
    grp_title: string
    grp_description: string
    grp_website: string
    grp_industry: string
    grp_country: string
    grp_timezone: string
    createdAt: string
    numberOfGroupUsers: number
    grp_users: UserDetails[]
    grp_manager: UserDetails
  }
  
  export interface GroupResponse {
    success: boolean
    message: string
    group: Group
  }

interface RolePermission {
    _id: string;
    permission: string;
  };
  
export interface GroupMember {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    userName: string;
    profilePicture: string;
    jobTitle: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    role_name: string;
    role_id: string;
    role_permissions: RolePermission[];
  };
  
export interface GroupMembersResponse {
    success: boolean;
    message: string;
    group_members: GroupMember[];
  };
  