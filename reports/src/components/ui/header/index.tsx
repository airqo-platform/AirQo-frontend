'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import React, { useState, useMemo } from 'react';
import { BsPerson, BsGrid3X3GapFill } from 'react-icons/bs';
// import { GoFileSubmodule } from 'react-icons/go';
import { HiOutlineSupport } from 'react-icons/hi';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

import DrawerComponent from '../CustomDrawer';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Products = [
  {
    name: 'Calibrate',
    href: 'https://airqalibrate.airqo.net/',
    icon: 'https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png',
  },
  {
    name: 'Analytics',
    href: 'https://analytics.airqo.net/',
    icon: 'https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png',
  },
];

const Header = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/reports/login' });
    setLoading(false);
    localStorage.clear(); // Clear all local storage data
  };

  const links = useMemo(
    () => [
      { href: '/home', icon: BsGrid3X3GapFill, label: 'Home' },
      // { href: '/files', icon: GoFileSubmodule, label: 'Saved Files' },
      { href: '/settings', icon: IoSettingsOutline, label: 'Settings' },
    ],
    [],
  );

  const List = useMemo(
    () => [
      {
        name: 'Support',
        onClick: () => {
          window.location.href = 'mailto:support@airqo.net';
        },
        icon: <HiOutlineSupport className="mr-2 h-4 w-4" />,
      },
      {
        name: 'Settings',
        onClick: () => router.push('/settings'),
        icon: <IoSettingsOutline className="mr-2 h-4 w-4" />,
      },
      {
        name: loading ? 'Logging out...' : 'Logout',
        onClick: handleLogout,
        icon: <IoLogOutOutline className="mr-2 h-4 w-4" />,
      },
    ],
    [loading, router],
  );

  return (
    <div className="sticky top-0 z-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="hidden md:block" />
        <div className="md:hidden">
          <DrawerComponent links={links} />
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer rounded-full p-2 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                <BsGrid3X3GapFill size={20} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-row max-w-[180px] flex-wrap justify-center items-center gap-4 mr-5 p-3 bg-white dark:bg-gray-800 dark:text-gray-300">
              {Products.map((item, index) => (
                <DropdownMenuCheckboxItem
                  key={index}
                  className="flex flex-col bg-[#1d4ed8] hover:bg-blue-900 p-1 items-center rounded-md cursor-pointer"
                  onClick={() => {
                    window.open(item.href, '_blank');
                  }}
                >
                  <Image
                    src={item.icon}
                    alt="Product Logo"
                    width={35}
                    height={35}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,..."
                  />
                  <span className="text-[10px] text-white">{item.name}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <BsPerson
                    size={34}
                    className="text-gray-600 text-2xl cursor-pointer rounded-full bg-gray-200 p-2 dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative right-6 w-52 bg-white dark:bg-gray-800 dark:text-gray-300">
                <DropdownMenuLabel>
                  {session?.user?.email && session?.user?.email.length > 30
                    ? session?.user?.email.slice(0, 30) + '...'
                    : session?.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-400" />
                {List.map((item, index) => (
                  <DropdownMenuCheckboxItem
                    key={index}
                    className="pl-1 w-full rounded-md cursor-pointer"
                    onClick={item.onClick}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
