import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoOrganization } from 'react-icons/go';
import CustomDropdown from './CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import RadioIcon from '@/icons/SideBar/radioIcon';
import Spinner from '@/components/Spinner';
import Button from '../Button';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
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

  // Create group item components
  const renderGroupItems = () =>
    groupList.map((group) => (
      <button
        key={group?._id}
        onClick={() => handleDropdownSelect(group)}
        className={`w-full h-11 px-3.5 rounded-lg py-2.5 mb-2 flex items-center justify-between ${
          activeGroupId === group._id
            ? 'bg-[#EBF5FF] text-blue-600'
            : 'hover:bg-gray-100'
        }`}
        disabled={loading && selectedGroupId === group._id}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 bg-yellow-200 flex-shrink-0 flex items-center justify-center rounded-full">
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
            <RadioIcon />
          ) : (
            <input type="radio" className="border-[#C4C7CB]" readOnly />
          )}
        </div>
      </button>
    ));

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
      dropDownClass="max-h-[260px] overflow-y-auto custom-scrollbar w-full"
      customPopperStyle={{
        width: isCollapsed ? 'auto' : '100%',
        maxWidth: isCollapsed ? '240px' : 'none',
      }}
    >
      {renderGroupItems()}
    </CustomDropdown>
  );
};

export default React.memo(OrganizationDropdown);
