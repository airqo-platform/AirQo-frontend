import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export function useGetActiveGroup() {
  const [loading, setLoading] = useState(true);
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);

  const activeGroupFromStorage = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('activeGroup') || 'null');
    } catch (error) {
      console.error('Error parsing activeGroup from local storage:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [userInfo, activeGroupFromStorage]);

  // If no userInfo or groups, return stored or default values
  if (!userInfo || !userInfo.groups || !chartData?.organizationName) {
    return {
      loading,
      id: activeGroupFromStorage?.id || null,
      title: activeGroupFromStorage?.grp_title || null,
      userID: userInfo?.id || null,
      groupList: userInfo?.groups || [],
    };
  }

  // Prioritize stored group if it exists in user's groups
  if (activeGroupFromStorage) {
    const storedGroupInUserGroups = userInfo.groups.find(
      (group) => group._id === activeGroupFromStorage._id,
    );

    if (storedGroupInUserGroups) {
      return {
        loading,
        id: storedGroupInUserGroups._id,
        title: storedGroupInUserGroups.grp_title,
        userID: userInfo._id,
        groupList: userInfo.groups,
      };
    }
  }

  // Find group matching chart organization name
  const matchingGroup = userInfo.groups.find(
    (group) => group.grp_title === chartData.organizationName,
  );

  if (matchingGroup) {
    return {
      loading,
      id: matchingGroup._id,
      title: matchingGroup.grp_title,
      userID: userInfo._id,
      groupList: userInfo.groups,
    };
  }

  // Fallback to first group if available
  if (userInfo.groups.length > 0) {
    const firstGroup = userInfo.groups[0];
    return {
      loading,
      id: firstGroup._id,
      title: firstGroup.grp_title,
      userID: userInfo._id,
      groupList: userInfo.groups,
    };
  }

  // Final fallback
  return {
    loading,
    id: null,
    title: null,
    userID: userInfo._id,
    groupList: [],
  };
}
