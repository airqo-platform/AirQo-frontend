import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export function useGetActiveGroup() {
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);

  // Safely parse activeGroup from local storage
  const activeGroup = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('activeGroup'));
    } catch (error) {
      console.error('Error parsing activeGroup from local storage:', error);
      return null;
    }
  }, []);

  // Ensure userInfo and groups exist
  if (!userInfo || !userInfo.groups || !chartData?.organizationName) {
    return {
      id: activeGroup?.id || null,
      title: activeGroup?.grp_title || null,
      userID: userInfo?.id || null,
      groupList: userInfo?.groups || [],
    };
  }

  // Find the group that matches the chartData.organizationName
  const matchingGroup = userInfo.groups.find(
    (group) => group.grp_title === chartData.organizationName,
  );

  // Return the matching group, activeGroup, or fallback values
  if (matchingGroup) {
    return {
      id: matchingGroup._id,
      title: matchingGroup.grp_title,
      userID: userInfo._id,
      groupList: userInfo.groups,
    };
  }

  if (activeGroup) {
    return {
      id: activeGroup._id,
      title: activeGroup.grp_title,
      userID: userInfo._id,
      groupList: userInfo.groups,
    };
  }

  // Fallback when no matching group or activeGroup is found
  return {
    id: null,
    title: null,
    userID: userInfo._id,
    groupList: userInfo.groups,
  };
}
