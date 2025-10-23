import type { User, Group } from '../types/api';

export interface NormalizedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  profilePicture: string;
  isActive: boolean;
  verified: boolean;
  country: string;
  organization: string;
  jobTitle: string;
  description: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedGroup {
  id: string;
  title: string;
  organizationSlug: string;
  profilePicture: string;
  createdAt: string;
  status: string;
  userType: string;
}

/**
 * Normalizes the user data from the API response
 */
export function normalizeUser(user: User): NormalizedUser {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userName: user.userName,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
    verified: user.verified,
    country: user.country,
    organization: user.organization,
    jobTitle: user.jobTitle,
    description: user.description,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Normalizes the groups data from the user's groups array
 */
export function normalizeGroups(groups: Group[]): NormalizedGroup[] {
  return groups.map(group => ({
    id: group._id,
    title: group.grp_title,
    organizationSlug: group.organization_slug,
    profilePicture: group.grp_profile_picture,
    createdAt: group.createdAt,
    status: group.status,
    userType: group.userType,
  }));
}

/**
 * Finds the default group (airqo) from the normalized groups
 */
export function findDefaultGroup(
  groups: NormalizedGroup[]
): NormalizedGroup | null {
  return (
    groups.find(group => group.organizationSlug === 'airqo') ||
    groups[0] ||
    null
  );
}
