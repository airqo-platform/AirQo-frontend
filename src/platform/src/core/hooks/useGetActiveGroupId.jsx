import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const findGroupByOrgName = (groups, orgName) =>
  groups?.find(
    (group) => group.grp_title.toLowerCase() === orgName?.toLowerCase(),
  );

export function useGetActiveGroup() {
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);

  useEffect(() => {
    setLoading(true);

    const matchingGroup = findGroupByOrgName(
      userInfo?.groups,
      chartData?.organizationName,
    );

    setActiveGroup(matchingGroup);
    setLoading(false);
  }, [chartData?.organizationName]);

  // If no userInfo or groups, return stored or default values
  if (!userInfo || !userInfo.groups || !chartData?.organizationName) {
    return {
      loading,
      id: activeGroup?._id || null,
      title: activeGroup?.grp_title || null,
      userID: userInfo?._id || null,
      groupList: userInfo?.groups || [],
    };
  }

  // Prioritize stored group if it exists in user's groups
  if (chartData.organizationName) {
    const storedGroupInUserGroups = findGroupByOrgName(
      userInfo?.groups,
      chartData?.organizationName,
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
  const matchingGroup = findGroupByOrgName(
    userInfo?.groups,
    chartData?.organizationName,
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
