import { useEffect, useState } from 'react';
import CustomDropdown from './CustomDropdown';
import CheckIcon from '@/icons/tickIcon';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';
import Spinner from '@/components/Spinner';

const splitNameIntoList = (fullName) => {
  if (fullName && fullName.length > 0) {
    const nameList = fullName.split(/[\s_]+/);
    return nameList;
  }
  return;
};

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
  const [activeGroup, setActiveGroup] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState({});
  const preferences = useSelector((state) => state.defaults.individual_preferences);
  const userInfo = useSelector((state) => state.login.userInfo);

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
        setActiveGroup(group);
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
    const userGroups = userInfo?.groups;

    if (storedActiveGroup && (!preferences || preferences[0]?.group_id === '')) {
      handleUpdatePreferences(storedActiveGroup);
    } else {
      setActiveGroup(storedActiveGroup);
    }

    if (userGroups) {
      setUserGroups(userGroups);
    }
  }, [userInfo, preferences]);

  const handleDropdownSelect = (option) => {
    if (activeGroup?.grp_title !== option?.grp_title) {
      handleUpdatePreferences(option);
    }
  };

  return (
    activeGroup &&
    activeGroup.grp_title && (
      <CustomDropdown
        trigger={
          <button>
            <div className='w-56 h-12 pl-2 pr-3 py-2 bg-white rounded border border-gray-200 justify-between items-center inline-flex'>
              <div className='justify-start items-center gap-3 flex'>
                <div className='w-8 h-8 py-1.5 bg-gray-50 rounded-full justify-center items-center flex gap-3'>
                  <div className='w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight'>
                    {activeGroup &&
                    activeGroup?.grp_title &&
                    splitNameIntoList(activeGroup?.grp_title).length > 1
                      ? splitNameIntoList(activeGroup?.grp_title)[0][0] +
                        splitNameIntoList(activeGroup?.grp_title)[1][0]
                      : splitNameIntoList(activeGroup?.grp_title)[0][0]}
                  </div>
                </div>
                <div className='pt-0.5 justify-start items-start gap-1 flex'>
                  <div
                    className='text-slate-500 text-sm font-medium uppercase leading-tight text-left'
                    title={formatString(activeGroup?.grp_title)}>
                    {activeGroup && activeGroup?.grp_title && activeGroup?.grp_title.length > 14
                      ? formatString(activeGroup?.grp_title.slice(0, 14)) + '...'
                      : formatString(activeGroup?.grp_title)}
                  </div>
                </div>
              </div>
              <span className={`${userGroups.length > 1 ? 'block' : 'hidden'}`}>
                <ChevronDownIcon />
              </span>
            </div>
          </button>
        }
        id='options'
        dropdownWidth='224px'
        dropStyle={{
          top: '41px',
          zIndex: 999,
          maxHeight: '320px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          display: userGroups.length > 1 ? 'block' : 'none',
        }}>
        {userGroups.map((format) => (
          <a
            key={format._id}
            href='#'
            onClick={() => handleDropdownSelect(format)}
            className={`w-56 h-11 px-3.5 py-2.5 justify-between items-center inline-flex ${
              activeGroup &&
              activeGroup?.grp_title === format?.grp_title &&
              'bg-secondary-neutral-light-50'
            }`}>
            <div className='grow shrink basis-0 h-6 justify-start items-center gap-2 flex'>
              <div className='w-8 h-8 py-1.5 bg-gray-50 rounded-full justify-center items-center flex'>
                <div className='w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight'>
                  {activeGroup &&
                  activeGroup?.grp_title &&
                  splitNameIntoList(format?.grp_title).length > 1
                    ? splitNameIntoList(format?.grp_title)[0][0] +
                      splitNameIntoList(format?.grp_title)[1][0]
                    : splitNameIntoList(format?.grp_title)[0][0]}
                </div>
              </div>
              <div
                className='max-w-[120px] w-full text-gray-700 text-sm font-normal leading-tight uppercase'
                title={format.grp_title}>
                {format && format.grp_title && format.grp_title.length > 24
                  ? formatString(format.grp_title.slice(0, 24)) + '...'
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
    )
  );
};

export default OrganizationDropdown;
