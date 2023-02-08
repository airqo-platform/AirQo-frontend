import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ArrowDropDownIcon from '@/icons/arrow_drop_down.svg';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  return (
    <span className={`h-10 pl-12 flex items-center hover:bg-light-blue`}>
      <Link href={itemPath} scroll={false}>
        <h3 className='text-sm text-black leading-[21px] hover:text-blue'>
          {itemLabel}
        </h3>
      </Link>
    </span>
  );
};

const SideBarItem = ({ Icon, label, dropdown, navPath, children }) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const handleToggleDropdown = () => setToggleDropdown(!toggleDropdown);

  return (
    <div
      className={`cursor-pointer ${
        toggleDropdown && 'bg-sidebar-blue rounded'
      }`}
    >
      <Link href={navPath || ''}>
        <div
          className={`flex items-center justify-between w-full h-12 hover:cursor-pointer mt-2`}
          role='button'
          tabIndex={0}
          onClick={dropdown && handleToggleDropdown}
        >
          <div className='flex items-center'>
            <div className='w-8 h-8 rounded-full flex items-center justify-center mr-4'>
              <Icon />
            </div>

            <h3
              className={`text-base font-normal text-black ${
                toggleDropdown && 'text-blue font-medium'
              }`}
            >
              {label}
            </h3>
          </div>
          {dropdown && (
            <div className='mr-6'>
              <ArrowDropDownIcon />
            </div>
          )}
        </div>
      </Link>

      {toggleDropdown && <div className='flex flex-col'>{children}</div>}
    </div>
  );
};

export default SideBarItem;
