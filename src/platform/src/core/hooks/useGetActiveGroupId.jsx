import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { getUserDetails } from '@/core/apis/Account';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';

const findGroupByOrgName = (groups, orgName) =>
  groups?.find(
    (group) => group.grp_title.toLowerCase() === orgName?.toLowerCase(),
  );

export function useGetActiveGroup() {
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { data: session } = useSession();
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);
  const activeGroup = useSelector((state) => state.activeGroup?.activeGroup);

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
  }, [fetchUserGroups]); // Determine active group based on chart organization name or fallback
  useEffect(() => {
    if (loading || userGroups.length === 0) return;

    let selectedGroup = null;

    // First, try to find group matching chart organization name
    if (chartData?.organizationName) {
      selectedGroup = findGroupByOrgName(
        userGroups,
        chartData.organizationName,
      );
    }

    // If no match found, try to get from session
    if (!selectedGroup && session?.user?.activeGroup) {
      selectedGroup = userGroups.find(
        (group) => group._id === session.user.activeGroup._id,
      );
    }

    // Fallback to first available group
    if (!selectedGroup && userGroups.length > 0) {
      selectedGroup = userGroups[0];
    }

    if (selectedGroup) {
      dispatch(setActiveGroup(selectedGroup));
    }
  }, [
    chartData?.organizationName,
    userGroups,
    session?.user?.activeGroup,
    loading,
    dispatch,
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
  };
}
