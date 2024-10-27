import React, { useEffect, useState, useCallback } from 'react';
import CustomDropdown from './CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import RadioIcon from '@/icons/SideBar/radioIcon';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../Button';
import { updateUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import Spinner from '@/components/Spinner';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';
export const formatString = (string) => {
  return string
    .replace(/_/g, ' ')
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    )
    .replace('Id', 'ID');
};

const OrganizationDropdown = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const userInfo = useSelector((state) => state.login.userInfo);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const [activeGroup, setActiveGroup] = useState(null);

  // Initialize activeGroup from localStorage or default to the first active group
  useEffect(() => {
    const storedActiveGroup = localStorage.getItem('activeGroup');
    if (storedActiveGroup) {
      const parsedGroup = JSON.parse(storedActiveGroup);
      setActiveGroup(parsedGroup);
    } else if (userInfo?.groups?.length > 0) {
      const firstActiveGroup =
        userInfo.groups.find((group) => group.status === 'ACTIVE') ||
        userInfo.groups[0];
      setActiveGroup(firstActiveGroup);
      localStorage.setItem('activeGroup', JSON.stringify(firstActiveGroup));
    }
  }, [userInfo]);

  // Function to handle updating user preferences
  const handleUpdatePreferences = useCallback(
    async (group) => {
      setLoading(true);
      setSelectedGroup(group);
      dispatch(setOrganizationName(group.grp_title));
      const userId = userInfo?._id;

      if (!userId || !group) {
        setLoading(false);
        return;
      }

      const data = {
        user_id: userId,
        group_id: group._id,
      };

      try {
        const response = await dispatch(updateUserPreferences(data));
        if (response && response.payload.success) {
          setActiveGroup(group);
          localStorage.setItem('activeGroup', JSON.stringify(group));
        }
      } catch (error) {
        console.error('Failed to update user preferences:', error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, userInfo],
  );

  // Function to handle dropdown selection
  const handleDropdownSelect = (group) => {
    if (activeGroup?.grp_title !== group?.grp_title) {
      handleUpdatePreferences(group);
    }
  };

  // Don't render the component if there's no active group
  if (!activeGroup) {
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
            <div className="justify-start items-center gap-3 flex">
              <div className="w-8 h-8 bg-yellow-200 py-1.5 rounded-full justify-center items-center flex gap-3">
                <div className="w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight">
                  {activeGroup?.grp_title
                    ? activeGroup.grp_title.slice(0, 2)
                    : ''}
                </div>
              </div>
              {!isCollapsed && (
                <div className="pt-0.5 justify-start items-start gap-1 flex">
                  <div
                    className="text-sm font-medium uppercase leading-tight text-left"
                    title={activeGroup?.grp_title}
                  >
                    {activeGroup?.grp_title?.length > 10
                      ? `${activeGroup.grp_title.slice(0, 10)}...`
                      : activeGroup?.grp_title}
                  </div>
                </div>
              )}
            </div>
            {userInfo?.groups?.length > 1 && !isCollapsed && (
              <span className="flex">
                <ChevronDownIcon />
              </span>
            )}
          </div>
        </Button>
      }
      sidebar={true}
      id="organization-dropdown"
    >
      {userInfo?.groups?.map((group) => (
        <button
          key={group._id}
          onClick={() => handleDropdownSelect(group)}
          className={`w-full h-11 px-3.5 rounded-xl py-2.5 justify-between items-center inline-flex ${
            activeGroup.grp_title === group.grp_title
              ? 'bg-[#EBF5FF] text-blue-600'
              : 'hover:bg-gray-100'
          }`}
        >
          <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
            <div className="w-8 h-8 py-1.5 bg-yellow-200 border border-white rounded-full justify-center items-center flex">
              <div className="w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight">
                {group.grp_title.slice(0, 2)}
              </div>
            </div>
            <div
              className="max-w-[120px] w-full text-left text-sm font-medium leading-tight uppercase"
              title={group.grp_title}
            >
              {group.grp_title.length > 10
                ? formatString(group.grp_title.slice(0, 10)) + '...'
                : formatString(group.grp_title)}
            </div>
          </div>
          {loading && selectedGroup?._id === group._id ? (
            <span>
              <Spinner width={16} height={16} />
            </span>
          ) : activeGroup?.grp_title === group?.grp_title ? (
            <span className="ml-2">
              <RadioIcon />
            </span>
          ) : (
            <input type="radio" className="border-[#C4C7CB]" />
          )}
        </button>
      ))}
    </CustomDropdown>
  );
};

export default OrganizationDropdown;
