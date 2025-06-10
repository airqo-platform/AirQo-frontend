import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getUserDetails } from '@/core/apis/Account';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';

const findGroupByOrgSlug = (groups, orgSlug) => {
  if (!orgSlug || !groups?.length) return null;

  // Convert slug back to title format for matching
  const slugToTitle = orgSlug.replace(/-/g, ' ').toLowerCase();

  return groups.find((group) => {
    const groupTitle = group.grp_title?.toLowerCase();
    // Try exact match first
    if (groupTitle === slugToTitle) return true;

    // Try slug-ified version match
    const groupSlug = groupTitle
      ?.replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return groupSlug === orgSlug;
  });
};

const findGroupByOrgName = (groups, orgName) =>
  groups?.find(
    (group) => group.grp_title?.toLowerCase() === orgName?.toLowerCase(),
  );

export function useGetActiveGroup() {
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  // Safely get router with error handling
  let router = null;
  try {
    router = useRouter();
  } catch {
    // Router not available in this context (e.g., SSR, non-page components)
    // Silently handle the error
    router = null;
  }

  const { data: session } = useSession();
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);
  const activeGroup = useSelector((state) => state.activeGroup?.activeGroup);

  // Extract organization slug from URL with fallback
  const orgSlug =
    router?.query?.org_slug ||
    router?.asPath?.match(/\/org\/([^/]+)/)?.[1] ||
    (typeof window !== 'undefined'
      ? window.location.pathname.match(/\/org\/([^/]+)/)?.[1]
      : null);
  // Fetch user groups from API using session user ID
  const fetchUserGroups = useCallback(async () => {
    if (!session?.user?.id) {
      // Fallback to Redux userInfo if session is not available
      if (userInfo?.groups) {
        const activeGroups = userInfo.groups.filter(
          (group) => group && group.status === 'ACTIVE',
        );
        setUserGroups(activeGroups);
        setLoading(false);
        return activeGroups;
      }
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getUserDetails(session.user.id);
      // Handle the API response structure - users array with groups
      const userDetails = response?.users?.[0] || response;
      const groups = userDetails?.groups || [];

      // Filter only active groups
      const activeGroups = groups.filter(
        (group) => group && group.status === 'ACTIVE',
      );
      setUserGroups(activeGroups);

      return activeGroups;
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to fetch user groups');
      setUserGroups([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, userInfo?.groups]);
  // Initial fetch of user groups
  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  // Determine active group based on URL slug, chart organization name, or fallback
  useEffect(() => {
    if (loading || userGroups.length === 0) return;

    let selectedGroup = null;

    // Priority 1: Try to find group matching URL organization slug
    if (orgSlug) {
      selectedGroup = findGroupByOrgSlug(userGroups, orgSlug);
    }

    // Priority 2: Try to find group matching chart organization name
    if (!selectedGroup && chartData?.organizationName) {
      selectedGroup = findGroupByOrgName(
        userGroups,
        chartData.organizationName,
      );
    }

    // Priority 3: Try to get from session
    if (!selectedGroup && session?.user?.activeGroup) {
      selectedGroup = userGroups.find(
        (group) => group._id === session.user.activeGroup._id,
      );
    }

    // Priority 4: Fallback to first available group
    if (!selectedGroup && userGroups.length > 0) {
      selectedGroup = userGroups[0];
    }

    if (selectedGroup) {
      dispatch(setActiveGroup(selectedGroup));
    }
  }, [
    orgSlug,
    chartData?.organizationName,
    userGroups,
    session?.user?.activeGroup,
    loading,
    dispatch,
  ]); // Determine which groups to use - prioritize fetched groups over Redux fallback
  const groupsToUse =
    userGroups.length > 0
      ? userGroups
      : userInfo?.groups?.filter((group) => group.status === 'ACTIVE') || [];
  const userIdToUse = session?.user?.id || userInfo?._id;

  // If no groups available, return empty state
  if (!groupsToUse.length) {
    return {
      loading,
      error,
      id: null,
      title: null,
      userID: userIdToUse || null,
      groupList: [],
    };
  }

  // Priority 1: Use group matching URL slug if in organization context
  if (orgSlug) {
    const slugMatchedGroup = findGroupByOrgSlug(groupsToUse, orgSlug);
    if (slugMatchedGroup) {
      return {
        loading,
        error,
        id: slugMatchedGroup._id,
        title: slugMatchedGroup.grp_title,
        userID: userIdToUse,
        groupList: groupsToUse,
      };
    }
  }

  // Priority 2: Use group matching chart organization name
  if (chartData?.organizationName) {
    const chartMatchedGroup = findGroupByOrgName(
      groupsToUse,
      chartData.organizationName,
    );
    if (chartMatchedGroup) {
      return {
        loading,
        error,
        id: chartMatchedGroup._id,
        title: chartMatchedGroup.grp_title,
        userID: userIdToUse,
        groupList: groupsToUse,
      };
    }
  }

  // Priority 3: Use active group from Redux state if available and valid
  if (
    activeGroup &&
    groupsToUse.some((group) => group._id === activeGroup._id)
  ) {
    return {
      loading,
      error,
      id: activeGroup._id,
      title: activeGroup.grp_title,
      userID: userIdToUse,
      groupList: groupsToUse,
    };
  }

  // Priority 4: Fallback to first available group
  const firstGroup = groupsToUse[0];
  return {
    loading,
    error,
    id: firstGroup._id,
    title: firstGroup.grp_title,
    userID: userIdToUse,
    groupList: groupsToUse,
  };
}
