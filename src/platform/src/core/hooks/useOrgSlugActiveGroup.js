import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { isEmpty } from 'underscore';
import {
  selectActiveGroup,
  selectUserGroups,
  setActiveGroup,
  fetchUserGroups,
} from '@/lib/store/services/groups';
import { removeSpacesAndLowerCase } from '@/core/utils/strings';

/**
 * Utility function to convert organization title to slug format
 * @param {string} title - Organization title
 * @returns {string} Slug format
 */
const titleToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Utility function to match organization group by slug
 * @param {Array} groups - User groups
 * @param {string} slug - Organization slug from URL
 * @returns {Object|null} Matched group or null
 */
const findGroupBySlug = (groups, slug) => {
  if (!groups || !slug) return null;

  const normalizedSlug = slug.toLowerCase();

  return groups.find((group) => {
    if (!group.grp_title) return false;

    // Try multiple matching strategies
    const strategies = [
      // Direct slug match (most common)
      titleToSlug(group.grp_title) === normalizedSlug,
      // Spaces and special chars removed
      removeSpacesAndLowerCase(group.grp_title) === normalizedSlug,
      // Direct lowercase match
      group.grp_title.toLowerCase() === normalizedSlug,
      // Check if slug is contained in title (for compound names)
      group.grp_title.toLowerCase().includes(normalizedSlug),
      // Reverse check - if title is contained in slug
      normalizedSlug.includes(group.grp_title.toLowerCase()),
    ];

    return strategies.some(Boolean);
  });
};

/**
 * Extract organization slug from pathname
 * @param {string} pathname - Current pathname
 * @returns {string|null} Organization slug or null
 */
const extractOrgSlug = (pathname) => {
  if (!pathname) return null;

  // Handle different organization URL patterns:
  // - /org/[slug]/...
  // - /(organization)/org/[slug]/...
  const orgMatch = pathname.match(/\/org\/([^/]+)/);
  if (orgMatch) {
    return orgMatch[1];
  }

  // Legacy patterns
  const legacyMatch = pathname.match(/\/organization\/([^/]+)/);
  return legacyMatch ? legacyMatch[1] : null;
};

/**
 * Custom hook to manage active group based on organization slug in URL
 * This ensures that when a user navigates to /org/[slug]/* routes,
 * the active group is automatically set to match the organization in the URL
 */
export const useOrgSlugActiveGroup = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const pathname = usePathname();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);

  // Determine if we're in organization context
  const isOrganizationContext = useMemo(() => {
    return (
      pathname?.includes('/org/') ||
      pathname?.startsWith('/org/') ||
      pathname?.includes('(organization)')
    );
  }, [pathname]);

  // Extract organization slug from URL
  const organizationSlug = useMemo(() => {
    return extractOrgSlug(pathname);
  }, [pathname]);

  // Fetch user groups if not already loaded
  useEffect(() => {
    const userID = session?.user?.id;
    if (userID && isEmpty(userGroups)) {
      dispatch(fetchUserGroups(userID));
    }
  }, [session?.user?.id, userGroups, dispatch]);

  // Set active group based on organization slug
  useEffect(() => {
    // Only proceed if we have user groups and are in organization context
    if (isEmpty(userGroups) || !isOrganizationContext || !organizationSlug) {
      return;
    }

    // Find the group that matches the organization slug
    const matchedGroup = findGroupBySlug(userGroups, organizationSlug);

    if (matchedGroup) {
      // Only update if it's different from current active group
      if (!activeGroup || activeGroup._id !== matchedGroup._id) {
        dispatch(setActiveGroup(matchedGroup));
      }
    }
  }, [
    userGroups,
    isOrganizationContext,
    organizationSlug,
    activeGroup,
    dispatch,
  ]);

  return {
    isOrganizationContext,
    organizationSlug,
    activeGroup,
    userGroups,
    matchedGroup: organizationSlug
      ? findGroupBySlug(userGroups, organizationSlug)
      : null,
  };
};

export default useOrgSlugActiveGroup;
