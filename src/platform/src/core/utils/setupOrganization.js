import { getOrganizationBySlugApi } from '@/core/apis/Organizations';
import { getUserDetails } from '@/core/apis/Account';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';
import { retryWithDelay } from './retryUtils';

/**
 * Setup organization user after successful authentication using NextAuth session
 * Fetches organization details and user details with full group information
 * @param {Object} session - NextAuth session object with organization context
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} orgSlug - Organization slug for context
 * @returns {Promise<{user: Object, organization: Object}>} - User and organization data
 */
export const setupOrganizationAfterLogin = async (
  session,
  dispatch,
  orgSlug,
) => {
  try {
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

    if (!session?.orgSlug || session.orgSlug !== orgSlug) {
      throw new Error('Invalid organization context in session');
    }

    logger.info(
      `Setting up organization context for ${orgSlug} with user ${session.user.id}`,
    );

    // 1. Fetch organization details
    let organizationData;
    try {
      const orgRes = await retryWithDelay(() =>
        getOrganizationBySlugApi(orgSlug),
      );
      organizationData = orgRes?.data || orgRes;

      if (!organizationData) {
        throw new Error('Organization not found');
      }

      logger.info(`Organization details fetched for ${orgSlug}`);
    } catch (orgError) {
      logger.warn(
        `Failed to fetch organization details: ${orgError.message || 'Unknown error'}`,
      );
      // Continue with minimal organization data from session
      organizationData = {
        _id: session.user.organization,
        name: session.user.long_organization || session.user.organization,
        slug: orgSlug,
      };
    }

    // 2. Fetch complete user details with groups using the getUserDetails API
    let userWithGroups;
    try {
      const userRes = await retryWithDelay(() =>
        getUserDetails(session.user.id),
      );

      if (!userRes.success || !userRes.users || userRes.users.length === 0) {
        throw new Error('User details not found');
      }

      userWithGroups = userRes.users[0];
      logger.info(
        `User details fetched for ${session.user.id} with ${userWithGroups.groups?.length || 0} groups`,
      );
    } catch (userError) {
      logger.error(
        `Failed to fetch user details from API: ${userError.message || 'Unknown error'}`,
      );

      // Fallback to session data if API fails
      userWithGroups = {
        _id: session.user.id,
        firstName: session.user.name?.split(' ')[0] || session.user.name,
        lastName:
          session.user.lastName ||
          session.user.name?.split(' ').slice(1).join(' '),
        name: session.user.name,
        email: session.user.email,
        organization: session.user.organization,
        long_organization: session.user.long_organization,
        groups: [
          {
            _id: session.user.organization,
            grp_title:
              session.user.long_organization || session.user.organization,
            organization: session.user.organization,
            status: 'ACTIVE',
          },
        ],
      };
    }

    // 3. Create organization-specific user object with complete group data
    const organizationUser = {
      _id: userWithGroups._id,
      firstName:
        userWithGroups.firstName ||
        session.user.name?.split(' ')[0] ||
        session.user.name,
      lastName:
        userWithGroups.lastName ||
        session.user.name?.split(' ').slice(1).join(' '),
      name: userWithGroups.name || session.user.name,
      email: userWithGroups.email || session.user.email,
      picture: userWithGroups.profilePicture || session.user.image,
      organization: session.user.organization,
      orgSlug: session.orgSlug,
      long_organization:
        session.user.long_organization || session.user.organization,
      userName: userWithGroups.userName || session.user.email,
      profilePicture: userWithGroups.profilePicture || session.user.image,
      phoneNumber: userWithGroups.phoneNumber,
      country: userWithGroups.country,
      jobTitle: userWithGroups.jobTitle,
      description: userWithGroups.description,
      timezone: userWithGroups.timezone,
      // Use complete groups data from API or fallback to session data
      groups: userWithGroups.groups?.filter(
        (group) => group.status === 'ACTIVE',
      ) || [
        {
          _id: session.user.organization,
          grp_title:
            session.user.long_organization || session.user.organization,
          organization: session.user.organization,
          status: 'ACTIVE',
        },
      ],
    };

    // 4. Find the active group that matches the current organization
    let activeGroup = null;

    // First, try to find the group that matches the current organization
    if (organizationUser.groups?.length > 0) {
      activeGroup = organizationUser.groups.find(
        (group) =>
          group.grp_title?.toLowerCase() ===
            session.user.organization?.toLowerCase() ||
          group.organization === session.user.organization ||
          group._id === session.user.organization,
      );

      // If no matching group found, use the first active group
      if (!activeGroup) {
        activeGroup = organizationUser.groups[0];
      }
    }

    // Fallback if no groups are available
    if (!activeGroup) {
      activeGroup = {
        _id: session.user.organization,
        grp_title: session.user.long_organization || session.user.organization,
        organization: session.user.organization,
        orgSlug: session.orgSlug,
        status: 'ACTIVE',
      };
    } else {
      // Ensure the active group has the orgSlug for proper routing
      activeGroup = {
        ...activeGroup,
        orgSlug: session.orgSlug,
      };
    }

    // 5. Update Redux store with organization user info and active group
    dispatch(setUserInfo(organizationUser));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    logger.info(
      `Organization setup completed for ${orgSlug} with active group: ${activeGroup.grp_title} (${organizationUser.groups?.length || 0} total groups available)`,
    );

    return { user: organizationUser, organization: organizationData };
  } catch (error) {
    logger.error(`Organization setup failed for ${orgSlug}:`, error);

    dispatch(setSuccess(false));
    dispatch(
      setError(error.message || 'Error setting up organization session'),
    );

    throw error;
  }
};

export default setupOrganizationAfterLogin;
