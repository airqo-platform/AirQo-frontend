import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { getUserDetails } from '@/core/apis/Account';

const findGroupByOrgName = (groups, orgName) =>
  groups?.find(
    (group) => group.grp_title.toLowerCase() === orgName?.toLowerCase(),
  );

export function useGetActiveGroupSession() {
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const [error, setError] = useState(null);

  const { data: session } = useSession();
  const chartData = useSelector((state) => state.chart);

  // Fetch user groups from API using session user ID
  const fetchUserGroups = useCallback(async () => {
    if (!session?.user?.id) {
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
    } catch (err) {
      setError(err);
      setUserGroups([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Initial fetch of user groups
  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  // Determine active group based on chart organization name or fallback
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
    setActiveGroup(selectedGroup);
  }, [
    chartData?.organizationName,
    userGroups,
    session?.user?.activeGroup,
    loading,
  ]);

  // Return hook data
  const returnData = {
    loading,
    error,
    id: activeGroup?._id || null,
    title: activeGroup?.grp_title || null,
    userID: session?.user?.id || null,
    groupList: userGroups,
    activeGroup,
    refetch: fetchUserGroups,
  };

  // Early return if no session user
  if (!session?.user?.id) {
    return {
      ...returnData,
      loading: false,
    };
  }

  return returnData;
}
