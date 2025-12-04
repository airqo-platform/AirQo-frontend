import type { User, Group, GroupDetails } from '../types/api';

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
export function normalizeUser(
  user: User | null | undefined
): NormalizedUser | null {
  if (!user || typeof user !== 'object' || !user._id) {
    return null;
  }
  return {
    id: user._id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    userName: user.userName || '',
    profilePicture: user.profilePicture || '',
    isActive: user.isActive || false,
    verified: user.verified || false,
    country: user.country || '',
    organization: user.organization || '',
    jobTitle: user.jobTitle || '',
    description: user.description || '',
    lastLogin: user.lastLogin || '',
    createdAt: user.createdAt || '',
    updatedAt: user.updatedAt || '',
  };
}

/**
 * Normalizes the groups data from the user's groups array
 */
export function normalizeGroups(
  groups: Group[] | null | undefined
): NormalizedGroup[] {
  if (!groups || !Array.isArray(groups)) {
    return [];
  }
  return groups
    .filter(group => group && typeof group === 'object' && group._id)
    .map(group => ({
      id: group._id,
      title: group.grp_title || '',
      organizationSlug: group.organization_slug || '',
      // Prioritize grp_image (logo) over grp_profile_picture for consistency
      profilePicture: group.grp_image || group.grp_profile_picture || '',
      createdAt: group.createdAt || '',
      status: group.status || '',
      userType: group.userType || '',
    }));
}

/**
 * Normalizes a single group from GroupDetails API response
 */
export function normalizeGroupDetails(
  groupDetails: GroupDetails | null | undefined
): NormalizedGroup | null {
  if (!groupDetails || typeof groupDetails !== 'object' || !groupDetails._id) {
    return null;
  }
  return {
    id: groupDetails._id,
    title: groupDetails.grp_title || '',
    organizationSlug: groupDetails.organization_slug || '',
    // Prioritize grp_image (logo) over grp_profile_picture for consistency
    profilePicture:
      groupDetails.grp_image || groupDetails.grp_profile_picture || '',
    createdAt: groupDetails.createdAt || '',
    status: groupDetails.grp_status || '',
    userType: 'group', // Default value since GroupDetails doesn't have userType
  };
}
