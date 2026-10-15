import type { User, Group, GroupDetails, AuthMethods } from '../types/api';

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
  authMethods?: AuthMethods;
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
    authMethods: user.authMethods,
  };
}

/**
 * Maps a raw group record onto a NormalizedGroup using ONLY canonical fields:
 * _id, grp_title, organization_slug, grp_image, grp_profile_picture,
 * grp_status, createdAt, userType. Returns null when there is no usable id.
 * Shared by every normalize* helper so the field mapping exists exactly once.
 */
function mapRawGroup(raw: Record<string, unknown>): NormalizedGroup | null {
  const id = typeof raw._id === 'string' ? raw._id : undefined;
  if (!id) {
    return null;
  }

  const slugSource =
    typeof raw.organization_slug === 'string' ? raw.organization_slug : '';

  return {
    id,
    title: typeof raw.grp_title === 'string' ? raw.grp_title : '',
    organizationSlug: slugSource.trim().toLowerCase(),
    // Prioritize grp_image (logo) over grp_profile_picture for consistency
    profilePicture:
      (typeof raw.grp_image === 'string' && raw.grp_image) ||
      (typeof raw.grp_profile_picture === 'string' &&
        raw.grp_profile_picture) ||
      '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    status: typeof raw.grp_status === 'string' ? raw.grp_status : '',
    userType: typeof raw.userType === 'string' ? raw.userType : '',
  };
}

/**
 * Normalizes the groups data from the user's groups array.
 *
 * Group.status is the non-canonical alias; the shared mapper only reads the
 * canonical grp_status, so forward status into that slot before mapping.
 */
export function normalizeGroups(
  groups: Group[] | null | undefined
): NormalizedGroup[] {
  if (!groups || !Array.isArray(groups)) {
    return [];
  }
  return groups
    .filter(group => group && typeof group === 'object' && group._id)
    .map(group => mapRawGroup({ ...group, grp_status: group.status }))
    .filter((group): group is NormalizedGroup => group !== null);
}

/**
 * Normalizes the discover-groups payload into NormalizedGroup[].
 * Accepts a { groups: [...] } envelope or a bare array of group records.
 * Entries without an id are dropped. Returns [] for any unusable input and
 * never throws.
 */
export function normalizeDiscoveredGroups(
  payload: unknown
): NormalizedGroup[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const envelope = payload as Record<string, unknown>;
  let rawGroups: unknown[];
  if (Array.isArray(envelope.groups)) {
    rawGroups = envelope.groups;
  } else if (Array.isArray(payload)) {
    rawGroups = payload;
  } else {
    return [];
  }

  return rawGroups
    .filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === 'object'
    )
    .map(item => mapRawGroup(item))
    .filter((group): group is NormalizedGroup => group !== null);
}

/**
 * Normalizes a single group from GroupDetails API response.
 * GroupDetails has no userType, so the canonical value is 'group'.
 */
export function normalizeGroupDetails(
  groupDetails: GroupDetails | null | undefined
): NormalizedGroup | null {
  if (!groupDetails || typeof groupDetails !== 'object' || !groupDetails._id) {
    return null;
  }
  const mapped = mapRawGroup(groupDetails as unknown as Record<string, unknown>);
  if (!mapped) {
    return null;
  }
  return { ...mapped, userType: 'group' };
}
