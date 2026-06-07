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
  cohorts?: string[]
  organization_slug?: string
  onboarding_checklist?: {
    is_dismissed: boolean;
    completed_steps: string[];
  }
}

export interface CohortGroupsResponse {
  success: boolean;
  message: string;
  groups: Group[];
}
