import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { theme } from '../../../../tailwind.config';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  return (
    <span className={`h-10 pl-12 flex items-center hover:bg-light-blue`}>
      <Link href={itemPath} scroll={false}>
        <h3 className='text-sm text-black leading-[21px] hover:text-blue'>{itemLabel}</h3>
      </Link>
    </span>
  );
};

const SideBarItem = ({ Icon, label, dropdown, navPath, children }) => {
  const [toggleDropdown, setToggleDropdown] = useState({
    analytics: localStorage.toggleDropdown.analytics || false,
    collocation: localStorage.toggleDropdown.collocation || false,
  });

  const handleToggleDropdown = (dropdownElem) => {
    if (dropdownElem === 'analytics') {
      setToggleDropdown({
        ...toggleDropdown,
        analytics: !toggleDropdown.analytics,
      });
    } else if (dropdownElem === 'collocation') {
      setToggleDropdown({
        ...toggleDropdown,
        collocation: !toggleDropdown.collocation,
      });
    }
    localStorage.setItem('toggleDropdown', JSON.stringify(toggleDropdown));
  };

  useEffect(() => {
    const dropdownToggleStatus = localStorage.getItem(toggleDropdown);
    console.log(dropdownToggleStatus);
    // if(dropdownToggleStatus) {
    //   setToggleDropdown(dropdownToggleStatus);
    // }
  }, []);

  return (
    <div
      className={`cursor-pointer ${
        toggleDropdown[label.toLowerCase()] && 'bg-sidebar-blue rounded'
      }`}
      role='button'
      tabIndex={0}
      onClick={() => {
        if (dropdown) {
          handleToggleDropdown(label.toLowerCase());
        }
      }}
    >
      <Link href={navPath || ''}>
        <div className={`flex items-center justify-between w-full h-12 hover:cursor-pointer mt-2`}>
          <div className='flex items-center'>
            <div className='w-8 h-8 rounded-full flex items-center justify-center mr-4'>
              <Icon />
            </div>

            <h3
              className={`text-base font-normal text-black ${
                toggleDropdown[label.toLowerCase()] && 'text-blue font-medium'
              }`}
            >
              {label}
            </h3>
          </div>
          {dropdown && (
            <div className='mr-6'>
              <ArrowDropDownIcon
                fillColor={toggleDropdown[label.toLowerCase()] && theme.extend.colors.blue}
              />
            </div>
          )}
        </div>
      </Link>

      {toggleDropdown[label.toLowerCase()] && <div className='flex flex-col'>{children}</div>}
    </div>
  );
};

export default SideBarItem;
