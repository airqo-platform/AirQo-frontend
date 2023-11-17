import { useEffect, useState } from 'react';
import CustomDropdown from './CustomDropdown';
import CheckIcon from '@/icons/tickIcon';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';

const splitNameIntoList = (fullName) => {
  if (fullName && fullName.length > 0) {
    const nameList = fullName.split(/[\s_]+/);
    return nameList;
  }
  return;
};

const OrganizationDropdown = () => {
  const [activeGroup, setActiveGroup] = useState({});
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const storedActiveGroup = localStorage.getItem('activeGroup');
    const storedUserGroups = localStorage.getItem('loggedUser');
    const userGroups = JSON.parse(storedUserGroups)?.groups;

    if (storedActiveGroup !== null) {
      setActiveGroup(JSON.parse(storedActiveGroup));
    }

    if (userGroups) {
      setUserGroups(userGroups);
    }
  }, []);

  const handleDropdownSelect = (option) => {
    setActiveGroup(option);
    localStorage.setItem('activeGroup', JSON.stringify(option));
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
                <div className='pt-0.5 justify-start items-center gap-1 flex'>
                  <div
                    className='text-slate-500 text-sm font-medium uppercase leading-tight'
                    title={activeGroup?.grp_title}
                  >
                    {activeGroup && activeGroup?.grp_title && activeGroup?.grp_title.length > 16
                      ? activeGroup?.grp_title.slice(0, 16) + '...'
                      : activeGroup?.grp_title}
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
        dropStyle={{
          top: '41px',
          zIndex: 999,
          width: '224px',
          maxHeight: '320px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          display: userGroups.length > 1 ? 'block' : 'none',
        }}
      >
        {userGroups.map((format) => (
          <a
            key={format}
            href='#'
            onClick={() => handleDropdownSelect(format)}
            className={`w-full h-11 px-3.5 py-2.5 justify-between items-center inline-flex ${
              activeGroup &&
              activeGroup?.grp_title === format?.grp_title &&
              'bg-secondary-neutral-light-50'
            }`}
          >
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
              <div className='max-w-[120px] w-full text-gray-700 text-sm font-normal leading-tight capitalize'>
                {format.grp_title}
              </div>
            </div>
            {activeGroup && activeGroup?.grp_title === format?.grp_title && (
              <CheckIcon fill='#145FFF' />
            )}
          </a>
        ))}
      </CustomDropdown>
    )
  );
};

export default OrganizationDropdown;
