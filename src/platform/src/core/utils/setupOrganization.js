import { getOrganizationBySlugApi } from '@/core/apis/Organizations';
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
 * Fetches organization details and sets up the organization context
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
    } // Note: We no longer store token or user data in localStorage
    // The session is managed by NextAuth and Redux stores user info

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

    // 2. Create organization-specific user object
    const organizationUser = {
      _id: session.user.id,
      firstName: session.user.name?.split(' ')[0] || session.user.name,
      name: session.user.name,
      email: session.user.email,
      picture: session.user.image,
      organization: session.user.organization,
      orgSlug: session.orgSlug,
      long_organization:
        session.user.long_organization || session.user.organization,
      // Add organization-specific groups structure if available
      groups: organizationData.groups || [
        {
          _id: session.user.organization,
          grp_title:
            session.user.long_organization || session.user.organization,
          organization: session.user.organization,
        },
      ],
    };

    // 3. Create active group for organization context
    const activeGroup = {
      _id: session.user.organization,
      grp_title: session.user.long_organization || session.user.organization,
      organization: session.user.organization,
      orgSlug: session.orgSlug,
    }; // 4. Update Redux store with organization user info and active group
    dispatch(setUserInfo(organizationUser));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    // Note: User data is now stored in Redux and session only
    // No localStorage usage for user/organization data

    return { user: organizationUser, organization: organizationData };
  } catch (error) {
    // Note: No localStorage cleanup needed as we don't store data there anymore

    dispatch(setSuccess(false));
    dispatch(
      setError(error.message || 'Error setting up organization session'),
    );

    throw error;
  }
};

export default setupOrganizationAfterLogin;
