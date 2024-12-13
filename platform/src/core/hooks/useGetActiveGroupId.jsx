import { useSelector } from 'react-redux';

export function useGetActiveGroup() {
  const userInfo = useSelector((state) => state?.login?.userInfo);
  const chartData = useSelector((state) => state.chart);

  // get activeGroup from local storage
  const activeGroup = JSON.parse(localStorage.getItem('activeGroup'));

  // Ensure userInfo and groups exist
  if (!userInfo || !userInfo.groups || !chartData?.organizationName) {
    return { id: null, title: null };
  }

  // Find the group that matches the chartData.organizationName
  const matchingGroup = userInfo.groups.find(
    (group) => group.grp_title === chartData.organizationName,
  );

  // Return the _id and grp_title of the matching group or null values if no match is found
  return matchingGroup
    ? {
        id: matchingGroup._id,
        title: matchingGroup.grp_title,
        userID: userInfo._id,
        groupList: userInfo.groups,
      }
    : {
        id: activeGroup._id,
        title: activeGroup.grp_title,
        userID: userInfo._id,
        groupList: userInfo.groups,
      };
}
