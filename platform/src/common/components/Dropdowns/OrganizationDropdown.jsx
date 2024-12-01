import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CustomDropdown from './CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import RadioIcon from '@/icons/SideBar/radioIcon';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../Button';
import { updateUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import Spinner from '@/components/Spinner';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';

// Utility functions moved to separate helpers
const formatGroupName = (name) => {
  if (!name || typeof name !== 'string') return 'Unknown';
  const trimmedName = name.trim();
  if (!trimmedName) return 'Unknown';

  return trimmedName.toLowerCase() === 'airqo'
    ? 'AirQo'
    : trimmedName
        .replace(/_/g, ' ')
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
};

const getAbbreviation = (name) => {
  if (!name || typeof name !== 'string') return 'NA';
  const trimmedName = name.trim();
  if (!trimmedName) return 'NA';

  return trimmedName.toLowerCase() === 'airqo'
    ? 'AQ'
    : trimmedName.slice(0, 2).toUpperCase();
};

const truncateText = (text, maxLength = 10) => {
  if (!text || typeof text !== 'string') return 'Unknown';
  const formatted = formatGroupName(text);
  return formatted.length > maxLength
    ? `${formatted.slice(0, maxLength)}...`
    : formatted;
};

const OrganizationDropdown = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const userInfo = useSelector((state) => state?.login?.userInfo);
  const isCollapsed = useSelector((state) => state?.sidebar?.isCollapsed);
  const groups = userInfo?.groups || [];

  // Memoize filtered active groups
  const activeGroups = useMemo(
    () => groups.filter((group) => group && group.status === 'ACTIVE'),
    [groups],
  );

  // Initialize activeGroup from localStorage or default to first active group
  useEffect(() => {
    const initializeActiveGroup = () => {
      try {
        const storedGroup = localStorage.getItem('activeGroup');
        if (storedGroup) {
          const parsedGroup = JSON.parse(storedGroup);
          setActiveGroup(parsedGroup);
          return;
        }

        if (activeGroups.length > 0) {
          const defaultGroup = activeGroups[0];
          setActiveGroup(defaultGroup);
          localStorage.setItem('activeGroup', JSON.stringify(defaultGroup));
        }
      } catch (error) {
        console.error('Error initializing active group:', error);
      }
    };

    initializeActiveGroup();
  }, [activeGroups]);

  const handleUpdatePreferences = useCallback(
    async (group) => {
      if (!userInfo?._id || !group?._id) {
        console.warn('Invalid user or group data');
        return;
      }

      setLoading(true);
      setSelectedGroupId(group._id);

      try {
        // Update organization name in store
        const orgName = group.grp_title || 'Unknown';
        dispatch(setOrganizationName(orgName));

        // Update user preferences
        const response = await dispatch(
          updateUserPreferences({
            user_id: userInfo._id,
            group_id: group._id,
          }),
        );

        if (response?.payload?.success) {
          setActiveGroup(group);
          localStorage.setItem('activeGroup', JSON.stringify(group));
        } else {
          console.warn('Failed to update user preferences');
        }
      } catch (error) {
        console.error('Error updating user preferences:', error);
      } finally {
        setLoading(false);
        setSelectedGroupId(null);
      }
    },
    [dispatch, userInfo],
  );

  const handleDropdownSelect = useCallback(
    (group) => {
      if (group?._id && activeGroup?._id !== group._id) {
        handleUpdatePreferences(group);
      }
    },
    [activeGroup, handleUpdatePreferences],
  );

  if (!activeGroup || !userInfo || groups.length === 0) {
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
                  title={formatGroupName(activeGroup.grp_title)}
                >
                  {truncateText(activeGroup.grp_title)}
                </div>
              )}
            </div>
            {groups.length > 1 && !isCollapsed && <ChevronDownIcon />}
          </div>
        </Button>
      }
      sidebar={true}
      id="organization-dropdown"
    >
      {groups.map((group) => (
        <button
          key={group?._id || `group-${Math.random()}`}
          onClick={() => handleDropdownSelect(group)}
          className={`w-full h-11 px-3.5 rounded-xl py-2.5 mb-[0.5rem] inline-flex items-center justify-between ${
            activeGroup?._id === group?._id
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
              {truncateText(group.grp_title)}
            </div>
          </div>
          {loading && selectedGroupId === group?._id ? (
            <Spinner width={16} height={16} />
          ) : activeGroup?._id === group?._id ? (
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
