import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ArrowDropDownIcon from '@/icons/arrow_drop_down.svg';

const DropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();

  return (
    <span
      className={`h-8 pl-12 flex items-center ${
        router.asPath === itemPath ? 'bg-[#CACACA]' : 'opacity-[0.08]'
      }`}
    >
      <Link href={itemPath} scroll={false}>
        <h3 className='text-sm text-black leading-[21px]'>{itemLabel}</h3>
      </Link>
    </span>
  );
};

const SideBarItem = ({ Icon, label, dropdown, active, navPath }) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const handleToggleDropdown = () => setToggleDropdown(!toggleDropdown);

  return (
    <div className={`${toggleDropdown && 'bg-[#D9D9D9] rounded-lg'}`}>
      <Link href={navPath || ''}>
        <div
          className={`flex items-center justify-between w-full h-12 ${
            !active && 'opacity-[0.16]'
          } hover:cursor-pointer`}
          onClick={dropdown && handleToggleDropdown}
        >
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-[#CBCACB] rounded-full flex items-center justify-center mr-4'>
              <Icon className='w-[15px] h-[15px]' />
            </div>

            <h3 className='text-base font-normal text-black'>{label}</h3>
          </div>

          {dropdown && (
            <div className='mr-6'>
              <ArrowDropDownIcon />
            </div>
          )}
        </div>
      </Link>

      {toggleDropdown && (
        <div className='flex flex-col'>
          <DropdownItem itemLabel='Overview' itemPath='' />
          <DropdownItem itemLabel='AirQlouds' itemPath='/analytics/airqlouds' />
          <DropdownItem itemLabel='Map view' itemPath='' />
          <DropdownItem itemLabel='Reports' itemPath='' />
        </div>
      )}
    </div>
  );
};

export default SideBarItem;
