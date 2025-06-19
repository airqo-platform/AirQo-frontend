import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { getUserDetails } from '@/core/apis/Account';
import { setActiveGroup } from '@/lib/store/services/groups';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { isAirQoGroup } from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

const findGroupByOrgName = (groups, orgName) =>
  groups?.find(
    (group) => group.grp_title.toLowerCase() === orgName?.toLowerCase(),
  );

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The id to validate
 * @returns {boolean} - Whether the id is valid
 */
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

export function useGetActiveGroup() {
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { data: session } = useSession();
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

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
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userDetails = await getUserDetails(session.user.id);
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
  // Only set active group if none exists (avoid overriding user selection)
  useEffect(() => {
    if (loading || userGroups.length === 0) return;

    // If there's already an active group set, and it exists in userGroups, keep it
    if (
      activeGroup &&
      userGroups.find((group) => group._id === activeGroup._id)
    ) {
      return; // Don't override existing valid active group
    }

    // Only set active group if none is currently set
    if (!activeGroup) {
      let selectedGroup = null;

      // Try to get from session first (from login setup)
      if (session?.user?.activeGroup) {
        selectedGroup = userGroups.find(
          (group) => group._id === session.user.activeGroup._id,
        );
      }

      // Fallback to AirQo or first available group
      if (!selectedGroup && userGroups.length > 0) {
        const airqoGroup = userGroups.find(isAirQoGroup);
        selectedGroup = airqoGroup || userGroups[0];
      }

      if (selectedGroup) {
        logger.info('useGetActiveGroupId: Setting active group:', {
          groupId: selectedGroup._id,
          groupName: selectedGroup.grp_title,
          source: session?.user?.activeGroup ? 'session' : 'fallback',
        });
        dispatch(setActiveGroup(selectedGroup));

        // Fetch preferences when setting active group
        if (
          session?.user?.id &&
          isValidObjectId(session.user.id) &&
          isValidObjectId(selectedGroup._id)
        ) {
          dispatch(
            getIndividualUserPreferences({
              identifier: session.user.id,
              groupID: selectedGroup._id,
            }),
          ).catch((error) => {
            // eslint-disable-next-line no-console
            console.warn(
              'Failed to fetch preferences for active group:',
              error,
            );
          });
        }
      }
    }
  }, [
    userGroups,
    session?.user?.activeGroup,
    session?.user?.id,
    loading,
    dispatch,
    activeGroup,
  ]);

  // Determine which groups to use - session-fetched or Redux fallback
  const groupsToUse =
    userGroups.length > 0 ? userGroups : userInfo?.groups || [];
  const userIdToUse = session?.user?.id || userInfo?._id;

  // If no userInfo or groups, return stored or default values
  if (!groupsToUse.length) {
    return {
      loading,
      error,
      id: activeGroup?._id || null,
      title: activeGroup?.grp_title || null,
      userID: userIdToUse || null,
      groupList: [],
      activeGroup: activeGroup || null,
    };
  }

  // Prioritize stored group if it exists in user's groups
  if (chartData?.organizationName) {
    const storedGroupInUserGroups = findGroupByOrgName(
      groupsToUse,
      chartData?.organizationName,
    );

    if (storedGroupInUserGroups) {
      return {
        loading,
        error,
        id: storedGroupInUserGroups._id,
        title: storedGroupInUserGroups.grp_title,
        userID: userIdToUse,
        groupList: groupsToUse,
        activeGroup: activeGroup || null,
      };
    }
  }

  // Use active group from Redux state if available
  if (activeGroup) {
    return {
      loading,
      error,
      id: activeGroup._id,
      title: activeGroup.grp_title,
      userID: userIdToUse,
      groupList: groupsToUse,
      activeGroup: activeGroup || null,
    };
  }

  // Fallback to first group if available
  if (groupsToUse.length > 0) {
    const firstGroup = groupsToUse[0];
    return {
      loading,
      error,
      id: firstGroup._id,
      title: firstGroup.grp_title,
      userID: userIdToUse,
      groupList: groupsToUse,
      activeGroup: activeGroup || null,
    };
  }

  // Final fallback
  return {
    loading,
    error,
    id: null,
    title: null,
    userID: userIdToUse,
    groupList: [],
    activeGroup: activeGroup || null,
  };
}
