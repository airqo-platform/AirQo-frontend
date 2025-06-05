import { getOrganizationBySlugApi } from '@/core/apis/Organizations';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Retry a function with delay on specific error conditions
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @returns {Promise} - Result of the function
 */
const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && err.response?.status === 429) {
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
      return retryWithDelay(fn, retries - 1);
    }
    throw err;
  }
};

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
    }

    // Store token for API calls if available
    if (session.accessToken) {
      localStorage.setItem('token', session.accessToken);
    }

    // Store basic user data immediately for faster UI updates
    const basicUserData = {
      _id: session.user.id,
      firstName: session.user.name?.split(' ')[0] || session.user.name,
      name: session.user.name,
      email: session.user.email,
      organization: session.user.organization,
      orgSlug: session.orgSlug,
    };
    localStorage.setItem('loggedUser', JSON.stringify(basicUserData));

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
    };

    // 4. Update Redux store with organization user info and active group
    dispatch(setUserInfo(organizationUser));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    // 5. Update localStorage with complete organization user data
    localStorage.setItem('loggedUser', JSON.stringify(organizationUser));

    return { user: organizationUser, organization: organizationData };
  } catch (error) {
    // Clear any partial data if setup fails
    localStorage.removeItem('token');
    localStorage.removeItem('loggedUser');

    dispatch(setSuccess(false));
    dispatch(
      setError(error.message || 'Error setting up organization session'),
    );

    throw error;
  }
};

export default setupOrganizationAfterLogin;
