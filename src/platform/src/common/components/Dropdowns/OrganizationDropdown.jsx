import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoOrganization } from 'react-icons/go';
import CustomDropdown from './CustomDropdown';
import Spinner from '@/components/Spinner';
import Button from '../Button';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const cleanGroupName = (name) => {
  if (!name) return '';
  return name.replace(/[-_]/g, ' ').toUpperCase();
};

const OrganizationDropdown = ({ className = '' }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const { theme, isSemiDarkEnabled } = useTheme();

  const {
    id: activeGroupId,
    title: activeGroupTitle,
    groupList,
    userID,
    loading: isFetchingActiveGroup,
  } = useGetActiveGroup();

  const isCollapsed = useSelector((state) => state?.sidebar?.isCollapsed);

  const activeGroups = useMemo(
    () => groupList.filter((group) => group && group.status === 'ACTIVE'),
    [groupList],
  );

  useEffect(() => {
    if (isFetchingActiveGroup) return;

    const storedGroup = localStorage.getItem('activeGroup');
    if (storedGroup) {
      try {
        const defaultGroup = JSON.parse(storedGroup);
        if (defaultGroup && defaultGroup.grp_title) {
          dispatch(setOrganizationName(defaultGroup.grp_title));
        } else {
          localStorage.removeItem('activeGroup');
        }
      } catch (error) {
        localStorage.removeItem('activeGroup');
        console.error('Error parsing stored group:', error);
      }
    } else if (!activeGroupId && activeGroups.length > 0) {
      const defaultGroup = activeGroups[0];
      localStorage.setItem('activeGroup', JSON.stringify(defaultGroup));
      if (defaultGroup && defaultGroup.grp_title) {
        dispatch(setOrganizationName(defaultGroup.grp_title));
      }
    }
  }, [isFetchingActiveGroup, activeGroupId, activeGroups, dispatch]);

  const handleUpdatePreferences = useCallback(
    async (group) => {
      if (!group?._id) return;

      setLoading(true);
      setSelectedGroupId(group._id);

      try {
        await dispatch(
          replaceUserPreferences({
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

  const handleDropdownSelect = (group) => {
    if (group?._id !== activeGroupId) {
      dispatch(setOrganizationName(group.grp_title));
      localStorage.setItem('activeGroup', JSON.stringify(group));
      handleUpdatePreferences(group);
    }
  };

  if (!activeGroupId || groupList.length === 0) {
    return null;
  }

  // Determine styles based on theme
  const dropdownBgColor =
    isSemiDarkEnabled || theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  const dropdownBorderColor =
    isSemiDarkEnabled || theme === 'dark'
      ? 'border-gray-700'
      : 'border-gray-200';

  const dropdownTextColor =
    isSemiDarkEnabled || theme === 'dark' ? 'text-white' : 'text-gray-800';

  const hoverBgColor =
    isSemiDarkEnabled || theme === 'dark'
      ? 'hover:bg-gray-700'
      : 'hover:bg-gray-100';

  const activeItemBgColor =
    isSemiDarkEnabled || theme === 'dark'
      ? 'bg-blue-900/30 text-blue-400'
      : 'bg-[#EBF5FF] text-blue-600';

  // Create group item components
  const renderGroupItems = () =>
    groupList.map((group) => (
      <button
        key={group?._id}
        onClick={() => handleDropdownSelect(group)}
        className={`
          w-full h-11 px-3.5 rounded-lg py-2.5 mb-2 flex items-center justify-between
          ${activeGroupId === group._id ? activeItemBgColor : hoverBgColor}
          ${dropdownTextColor}
        `}
        disabled={loading && selectedGroupId === group._id}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={`w-8 h-8 ${isSemiDarkEnabled || theme === 'dark' ? 'bg-gray-600' : 'bg-yellow-200'} flex-shrink-0 flex items-center justify-center rounded-full`}
          >
            <GoOrganization className="text-slate-600 text-lg" />
          </div>
          <div
            className="text-sm font-medium truncate"
            title={cleanGroupName(group.grp_title)}
          >
            {cleanGroupName(group.grp_title)}
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          {loading && selectedGroupId === group._id ? (
            <Spinner width={16} height={16} />
          ) : activeGroupId === group._id ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-500 dark:text-blue-400"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                fill={
                  isSemiDarkEnabled || theme === 'dark' ? '#60a5fa' : '#3b82f6'
                }
              />
              <circle
                cx="12"
                cy="12"
                r="11"
                stroke={
                  isSemiDarkEnabled || theme === 'dark' ? '#60a5fa' : '#3b82f6'
                }
                strokeWidth="2"
              />
            </svg>
          ) : (
            <div
              className={`w-4 h-4 rounded-full border ${isSemiDarkEnabled || theme === 'dark' ? 'border-gray-500' : 'border-gray-400'}`}
            ></div>
          )}
        </div>
      </button>
    ));

  // Set the dropdown style for theme
  const dropdownStyleProps = {
    backgroundColor:
      isSemiDarkEnabled || theme === 'dark' ? '#1f2937' : '#ffffff',
    borderColor: isSemiDarkEnabled || theme === 'dark' ? '#374151' : '#e5e7eb',
    boxShadow:
      isSemiDarkEnabled || theme === 'dark'
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  return (
    <CustomDropdown
      trigger={
        <Button
          paddingStyles="p-0 m-0"
          className={`w-full border-none ${className}`}
          variant="outlined"
        >
          <div
            className={`
              w-full h-12 p-2 rounded-xl border
              ${dropdownBgColor} ${dropdownBorderColor} ${hoverBgColor}
              ${isCollapsed ? 'flex justify-center' : 'inline-flex justify-between items-center'}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 ${isSemiDarkEnabled || theme === 'dark' ? 'bg-gray-600' : 'bg-yellow-200'} flex items-center justify-center rounded-full`}
              >
                <GoOrganization className="text-slate-600 text-lg" />
              </div>
              {!isCollapsed && (
                <div
                  className={`text-sm font-medium leading-tight truncate max-w-[150px] ${dropdownTextColor}`}
                  title={cleanGroupName(activeGroupTitle)}
                >
                  {cleanGroupName(activeGroupTitle)}
                </div>
              )}
            </div>
            {groupList.length > 1 && !isCollapsed && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke={
                    isSemiDarkEnabled || theme === 'dark'
                      ? '#ffffff'
                      : '#1f2937'
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </Button>
      }
      sidebar={true}
      id="organization-dropdown"
      dropDownClass={`
        max-h-[260px] overflow-y-auto custom-scrollbar w-full
        ${
          isSemiDarkEnabled || theme === 'dark'
            ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
            : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'
        }
      `}
      customPopperStyle={{
        width: isCollapsed ? 'auto' : '100%',
        maxWidth: isCollapsed ? '240px' : 'none',
      }}
      dropdownStyle={dropdownStyleProps}
    >
      {groupList.length > 0 ? (
        renderGroupItems()
      ) : (
        <div className={`p-3 text-center ${dropdownTextColor}`}>
          No groups available
        </div>
      )}
    </CustomDropdown>
  );
};

export default React.memo(OrganizationDropdown);
