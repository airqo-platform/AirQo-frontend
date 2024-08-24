'use client';
import React, { useEffect, useMemo, useState } from 'react';
import CustomDropdown from './CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import RadioIcon from '@/icons/SideBar/radioIcon';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../Button';
import {
  updateUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import Spinner from '@/components/Spinner';

export const formatString = (string) => {
  return string
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })
    .replace('Id', 'ID');
};

const OrganizationDropdown = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState({});
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const userInfo = useSelector((state) => state.login.userInfo);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const handleUpdatePreferences = async (group) => {
    setLoading(true);
    setSelectedGroup(group);
    const userId = userInfo?._id;
    const data = {
      user_id: userId,
      group_id: group._id,
    };

    try {
      const response = await dispatch(updateUserPreferences(data));
      if (response && response.payload.success) {
        localStorage.setItem('activeGroup', JSON.stringify(group));
        // Refetch the preferences
        await dispatch(getIndividualUserPreferences(userId));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedActiveGroup = JSON.parse(localStorage.getItem('activeGroup'));

    if (
      storedActiveGroup &&
      (!preferences || preferences[0]?.group_id === '')
    ) {
      handleUpdatePreferences(storedActiveGroup);
    }
  }, [userInfo, preferences]);

  const handleDropdownSelect = (option) => {
    const activeGroup = JSON.parse(localStorage.getItem('activeGroup'));
    if (activeGroup?.grp_title !== option?.grp_title) {
      handleUpdatePreferences(option);
    }
  };

  // Don't render the component if there's no active group
  const activeGroup = JSON.parse(localStorage.getItem('activeGroup'));
  if (!activeGroup) {
    return null;
  }

  const dropdown = useMemo(() => {
    return (
      <CustomDropdown
        trigger={
          <Button paddingStyles="p-0 m-0" className="w-full">
            <div
              className={`w-full h-12 p-2 bg-white rounded-xl border border-gray-200 ${isCollapsed ? 'flex justify-center' : 'inline-flex justify-between items-center'} hover:bg-gray-100`}
            >
              <div className="justify-start items-center gap-3 flex">
                <div className="w-8 h-8 bg-yellow-200 py-1.5 rounded-full justify-center items-center flex gap-3">
                  <div className="w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight">
                    {activeGroup?.grp_title
                      ? activeGroup.grp_title.slice(0, 2)
                      : ''}
                  </div>
                </div>
                <div
                  className={`pt-0.5 justify-start items-start gap-1 ${
                    !isCollapsed ? 'flex' : 'hidden'
                  }`}
                >
                  <div
                    className="text-sm font-medium uppercase leading-tight text-left"
                    title={activeGroup?.grp_title}
                  >
                    {activeGroup?.grp_title?.length > 10
                      ? `${activeGroup.grp_title.slice(0, 10)}...`
                      : activeGroup?.grp_title}
                  </div>
                </div>
              </div>
              <span
                className={`${
                  userInfo && userInfo.groups && userInfo.groups.length > 1
                    ? 'block'
                    : 'hidden'
                } ${!isCollapsed ? 'flex' : 'hidden'}`}
              >
                <ChevronDownIcon />
              </span>
            </div>
          </Button>
        }
        sidebar={true}
        id="options"
      >
        {userInfo &&
          userInfo.groups &&
          userInfo.groups.map((format) => (
            <Button
              paddingStyles="p-0 m-0 shadow-none text-left"
              key={format._id}
              onClick={() => handleDropdownSelect(format)}
              className={`w-full h-11 px-3.5 rounded-xl py-2.5 justify-between items-center inline-flex ${
                activeGroup && activeGroup?.grp_title === format?.grp_title
                  ? 'bg-[#EBF5FF] text-blue-600'
                  : 'hover:bg-gray-100'
              }  
              `}
            >
              <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
                <div className="w-8 h-8 py-1.5 bg-yellow-200 border border-white rounded-full justify-center items-center flex">
                  <div className="w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight">
                    {format?.grp_title ? format.grp_title.slice(0, 2) : ''}
                  </div>
                </div>
                <div
                  className="max-w-[120px] w-full text-sm font-medium leading-tight uppercase"
                  title={format.grp_title}
                >
                  {format && format.grp_title && format.grp_title.length > 10
                    ? formatString(format.grp_title.slice(0, 10)) + '...'
                    : formatString(format.grp_title)}
                </div>
              </div>
              {loading && selectedGroup._id === format._id ? (
                <span>
                  <Spinner width={16} height={16} />
                </span>
              ) : activeGroup &&
                activeGroup?.grp_title === format?.grp_title ? (
                <span className="ml-2">
                  <RadioIcon />
                </span>
              ) : (
                <input type="radio" className="border-[#C4C7CB]" />
              )}
            </Button>
          ))}
      </CustomDropdown>
    );
  }, [activeGroup, userInfo?.groups, isCollapsed, loading, selectedGroup]);

  return dropdown;
};

export default OrganizationDropdown;
