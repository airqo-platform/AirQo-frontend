import React, { useEffect, useMemo, useState } from 'react';
import CustomDropdown from './CustomDropdown';
import CheckIcon from '@/icons/tickIcon';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { useDispatch, useSelector } from 'react-redux';
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
  const preferences = useSelector((state) => state.defaults.individual_preferences);
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
      if (response.payload.success) {
        localStorage.setItem('activeGroup', JSON.stringify(group));
        // Refetch the preferences
        await dispatch(getIndividualUserPreferences(userId));
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedActiveGroup = JSON.parse(localStorage.getItem('activeGroup'));

    if (storedActiveGroup && (!preferences || preferences[0]?.group_id === '')) {
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
          <button className='w-full'>
            <div className='w-full h-12 pl-2 pr-3 py-2 bg-white rounded border border-gray-200 justify-between items-center inline-flex'>
              <div className='justify-start items-center gap-3 flex'>
                <div className='w-8 h-8 py-1.5 bg-gray-50 rounded-full justify-center items-center flex gap-3'>
                  <div className='w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight'>
                    {activeGroup?.grp_title ? activeGroup.grp_title[0] : ''}
                  </div>
                </div>
                <div
                  className={`pt-0.5 justify-start items-start gap-1 ${
                    !isCollapsed ? 'flex' : 'hidden'
                  }`}>
                  <div
                    className='text-slate-500 text-sm font-medium uppercase leading-tight text-left'
                    title={activeGroup?.grp_title}>
                    {activeGroup?.grp_title?.length > 10
                      ? `${activeGroup.grp_title.slice(0, 10)}...`
                      : activeGroup?.grp_title}
                  </div>
                </div>
              </div>
              <span
                className={`${userInfo?.groups.length > 1 ? 'block' : 'hidden'} ${
                  !isCollapsed ? 'flex' : 'hidden'
                }`}>
                <ChevronDownIcon />
              </span>
            </div>
          </button>
        }
        id='options'>
        {userInfo?.groups.map((format) => (
          <a
            key={format._id}
            href='#'
            onClick={() => handleDropdownSelect(format)}
            className={`w-full h-11 px-3.5 py-2.5 justify-between items-center inline-flex ${
              activeGroup &&
              activeGroup?.grp_title === format?.grp_title &&
              'bg-secondary-neutral-light-50'
            }`}>
            <div className='grow shrink basis-0 h-6 justify-start items-center gap-2 flex'>
              <div className='w-8 h-8 py-1.5 bg-gray-50 rounded-full justify-center items-center flex'>
                <div className='w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight'>
                  {format?.grp_title ? format.grp_title[0] : ''}
                </div>
              </div>
              <div
                className='max-w-[120px] w-full text-gray-700 text-sm font-normal leading-tight uppercase'
                title={format.grp_title}>
                {format && format.grp_title && format.grp_title.length > 10
                  ? formatString(format.grp_title.slice(0, 10)) + '...'
                  : formatString(format.grp_title)}
              </div>
            </div>
            {loading && selectedGroup._id === format._id ? (
              <span>
                <Spinner width={20} height={20} />
              </span>
            ) : activeGroup && activeGroup?.grp_title === format?.grp_title ? (
              <CheckIcon fill='#145FFF' />
            ) : null}
          </a>
        ))}
      </CustomDropdown>
    );
  }, [activeGroup, userInfo?.groups, isCollapsed, loading, selectedGroup]);

  return dropdown;
};

export default OrganizationDropdown;
