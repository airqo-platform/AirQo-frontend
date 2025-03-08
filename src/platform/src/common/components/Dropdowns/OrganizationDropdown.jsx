import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoOrganization } from 'react-icons/go';
import CustomDropdown from './CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import RadioIcon from '@/icons/SideBar/radioIcon';
import Spinner from '@/components/Spinner';
import Button from '../Button';
import { updateUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

const cleanGroupName = (name) => {
  if (!name) return '';
  return name.replace(/[-_]/g, ' ').toUpperCase();
};

const OrganizationDropdown = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const {
    id: activeGroupId,
    title: activeGroupTitle,
    groupList,
    userID,
    loading: isFetchingActiveGroup,
  } = useGetActiveGroup();

  const isCollapsed = useSelector((state) => state?.sidebar?.isCollapsed);

  // Filter active groups
  const activeGroups = useMemo(
    () => groupList.filter((group) => group && group.status === 'ACTIVE'),
    [groupList],
  );

  // Initialize active group if missing
  useEffect(() => {
    // If we're still fetching, do nothing yet
    if (isFetchingActiveGroup) return;

    const storedGroup = localStorage.getItem('activeGroup');
    if (storedGroup) {
      try {
        // Attempt to parse the stored group
        const defaultGroup = JSON.parse(storedGroup);

        // Check if defaultGroup and its properties exist
        if (defaultGroup && defaultGroup.grp_title) {
          dispatch(setOrganizationName(defaultGroup.grp_title));
        } else {
          // If the stored data is missing expected fields, remove it
          localStorage.removeItem('activeGroup');
          console.warn(
            'activeGroup in localStorage is missing grp_title, removing it...',
          );
        }
      } catch (error) {
        // If JSON parsing fails, remove the invalid item
        console.error('Error parsing activeGroup from localStorage:', error);
        localStorage.removeItem('activeGroup');
      }
    } else if (!activeGroupId && activeGroups.length > 0) {
      // No activeGroup in localStorage, so pick the first available group
      const defaultGroup = activeGroups[0];
      localStorage.setItem('activeGroup', JSON.stringify(defaultGroup));
      if (defaultGroup && defaultGroup.grp_title) {
        dispatch(setOrganizationName(defaultGroup.grp_title));
      }
    }
  }, [isFetchingActiveGroup, activeGroupId, activeGroups, dispatch]);

  const handleUpdatePreferences = useCallback(
    async (group) => {
      if (!group?._id) {
        console.warn('Invalid group data');
        return;
      }
      setLoading(true);
      setSelectedGroupId(group._id);
      try {
        await dispatch(
          updateUserPreferences({
            user_id: userID,
            group_id: group._id,
          }),
        );
      } catch (error) {
        console.error('Error updating user preferences:', error);
      } finally {
        setLoading(false);
        setSelectedGroupId(null);
      }
    },
    [dispatch, userID],
  );

  const handleDropdownSelect = useCallback(
    (group) => {
      if (group?._id !== activeGroupId) {
        // Immediately update organization name
        dispatch(setOrganizationName(group.grp_title));
        localStorage.setItem('activeGroup', JSON.stringify(group));

        // Dispatch preferences update asynchronously
        handleUpdatePreferences(group);
      }
    },
    [activeGroupId, handleUpdatePreferences, dispatch],
  );

  if (!activeGroupId || groupList.length === 0) {
    return null;
  }

  return (
    <CustomDropdown
      trigger={
        <Button
          paddingStyles="p-0 m-0"
          className="w-full border-none"
          variant="outlined"
        >
          <div
            className={`w-full h-12 p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 ${
              isCollapsed
                ? 'flex justify-center'
                : 'inline-flex justify-between items-center'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Organization Icon in place of abbreviation */}
              <div className="w-8 h-8 bg-yellow-200 flex items-center justify-center rounded-full">
                <GoOrganization className="text-slate-600 text-lg" />
              </div>
              {!isCollapsed && (
                <div
                  className="text-sm font-medium leading-tight truncate max-w-[200px]"
                  title={cleanGroupName(activeGroupTitle)}
                >
                  {cleanGroupName(activeGroupTitle)}
                </div>
              )}
            </div>
            {groupList.length > 1 && !isCollapsed && <ChevronDownIcon />}
          </div>
        </Button>
      }
      sidebar={true}
      id="organization-dropdown"
    >
      {groupList.map((group) => (
        <button
          key={group?._id}
          onClick={() => handleDropdownSelect(group)}
          className={`w-full h-11 px-3.5 rounded-xl py-2.5 mb-[0.5rem] inline-flex items-center justify-between ${
            activeGroupId === group._id
              ? 'bg-[#EBF5FF] text-blue-600'
              : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Organization Icon */}
            <div className="w-8 h-8 bg-yellow-200 flex items-center justify-center rounded-full">
              <GoOrganization className="text-slate-600 text-lg" />
            </div>
            <div
              className="text-sm font-medium truncate max-w-[150px]"
              title={cleanGroupName(group.grp_title)}
            >
              {cleanGroupName(group.grp_title).length > 14
                ? `${cleanGroupName(group.grp_title).substring(0, 15)}...`
                : cleanGroupName(group.grp_title)}
            </div>
          </div>
          {loading && selectedGroupId === group._id ? (
            <Spinner width={16} height={16} />
          ) : activeGroupId === group._id ? (
            <RadioIcon />
          ) : (
            <input type="radio" className="border-[#C4C7CB]" readOnly />
          )}
        </button>
      ))}
    </CustomDropdown>
  );
};

export default OrganizationDropdown;
