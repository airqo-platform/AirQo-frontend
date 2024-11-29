import React, { useEffect, useState, useCallback } from 'react';
import CustomDropdown from './CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import RadioIcon from '@/icons/SideBar/radioIcon';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../Button';
import { updateUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import Spinner from '@/components/Spinner';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';

// Format group name to display "AirQo" correctly and capitalize others
export const formatGroupName = (name) => {
  if (!name) return 'Unknown';
  return name.toLowerCase() === 'airqo'
    ? 'AirQo'
    : name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Get abbreviation for the group name
export const getAbbreviation = (name) => {
  if (!name) return 'NA';
  return name.toLowerCase() === 'airqo' ? 'AQ' : name.slice(0, 2).toUpperCase();
};

const OrganizationDropdown = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const userInfo = useSelector((state) => state?.login?.userInfo);
  const isCollapsed = useSelector((state) => state?.sidebar?.isCollapsed);

  // Initialize activeGroup from localStorage or default to the first active group
  useEffect(() => {
    try {
      const storedActiveGroup = localStorage.getItem('activeGroup');
      if (storedActiveGroup) {
        setActiveGroup(JSON.parse(storedActiveGroup));
      } else if (userInfo?.groups?.length > 0) {
        const defaultGroup =
          userInfo.groups.find((group) => group.status === 'ACTIVE') ||
          userInfo.groups[0];
        setActiveGroup(defaultGroup);
        localStorage.setItem('activeGroup', JSON.stringify(defaultGroup));
      }
    } catch (error) {
      console.error('Error initializing active group:', error);
    }
  }, [userInfo]);

  // Handle updating user preferences
  const handleUpdatePreferences = useCallback(
    async (group) => {
      if (!userInfo?._id || !group) {
        console.warn('Invalid user or group data.');
        return;
      }

      setLoading(true);
      setSelectedGroup(group);

      try {
        dispatch(setOrganizationName(group.grp_title || 'Unknown'));

        const data = {
          user_id: userInfo._id,
          group_id: group._id,
        };

        const response = await dispatch(updateUserPreferences(data));
        if (response?.payload?.success) {
          setActiveGroup(group);
          localStorage.setItem('activeGroup', JSON.stringify(group));
        } else {
          console.warn('Failed to update user preferences.');
        }
      } catch (error) {
        console.error('Error updating user preferences:', error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, userInfo],
  );

  // Handle dropdown selection
  const handleDropdownSelect = (group) => {
    if (activeGroup?.grp_title !== group?.grp_title) {
      handleUpdatePreferences(group);
    }
  };

  // Don't render the component if there's no active group or user info
  if (!activeGroup || !userInfo) {
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
            className={`w-full h-12 p-2 bg-white rounded-xl border border-gray-200 ${
              isCollapsed
                ? 'flex justify-center'
                : 'inline-flex justify-between items-center'
            } hover:bg-gray-100`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-200 flex items-center justify-center rounded-full">
                <span className="text-slate-500 text-sm font-medium">
                  {getAbbreviation(activeGroup.grp_title)}
                </span>
              </div>
              {!isCollapsed && (
                <div
                  className="text-sm font-medium leading-tight"
                  title={activeGroup?.grp_title || 'Unknown'}
                >
                  {activeGroup.grp_title?.length > 10
                    ? `${formatGroupName(activeGroup.grp_title).slice(0, 10)}...`
                    : formatGroupName(activeGroup.grp_title)}
                </div>
              )}
            </div>
            {userInfo?.groups?.length > 1 && !isCollapsed && (
              <ChevronDownIcon />
            )}
          </div>
        </Button>
      }
      sidebar={true}
      id="organization-dropdown"
    >
      {userInfo?.groups?.map((group) => (
        <button
          key={group?._id || Math.random()} // Handle missing group IDs
          onClick={() => handleDropdownSelect(group)}
          className={`w-full h-11 px-3.5 rounded-xl py-2.5 mb-[0.5rem] inline-flex items-center justify-between ${
            activeGroup?.grp_title === group?.grp_title
              ? 'bg-[#EBF5FF] text-blue-600'
              : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-200 flex items-center justify-center rounded-full">
              <span className="text-slate-500 text-sm font-medium">
                {getAbbreviation(group.grp_title)}
              </span>
            </div>
            <div
              className="max-w-[120px] text-left text-sm font-medium"
              title={formatGroupName(group.grp_title)}
            >
              {group.grp_title?.length > 10
                ? `${formatGroupName(group.grp_title).slice(0, 10)}...`
                : formatGroupName(group.grp_title)}
            </div>
          </div>
          {loading && selectedGroup?._id === group?._id ? (
            <Spinner width={16} height={16} />
          ) : activeGroup?.grp_title === group?.grp_title ? (
            <RadioIcon />
          ) : (
            <input type="radio" className="border-[#C4C7CB]" />
          )}
        </button>
      ))}
    </CustomDropdown>
  );
};

export default OrganizationDropdown;
