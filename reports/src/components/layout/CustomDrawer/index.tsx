'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { IconType } from 'react-icons';
import { IoIosMenu } from 'react-icons/io';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '../../ui/drawer';
import { Separator } from '../../ui/separator';

import AirQoLogo from '@/public/assets/images/airqo.png';

interface DrawerComponentProps {
  links: {
    href: string;
    icon: IconType;
    label: string;
  }[];
}

const DrawerComponent: React.FC<DrawerComponentProps> = ({ links }) => {
  const pathname = usePathname();

  const isActive = (route: string) => pathname.startsWith(route);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <button className="cursor-pointer">
          <IoIosMenu size={30} />
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-blue-600 border-none text-white flex flex-col items-center rounded-none">
        <DrawerHeader className="mx-auto w-full space-y-4 max-w-sm">
          <div className="flex flex-row items-center justify-start space-x-3">
            <Image
              alt="Logo"
              src={AirQoLogo}
              className="rounded-full"
              width={50}
              height={50}
            />
            <h1 className="text-xl font-bold">AQ Report</h1>
          </div>
        </DrawerHeader>
        <Separator className="bg-white" />
        <div className="flex flex-col items-center space-y-3 w-full justify-center p-4">
          {links.map(({ href, icon: Icon, label }) => (
            <Link href={href} className="w-full" key={href}>
              <span
                className={`flex flex-row rounded-lg items-center justify-start space-x-3 p-2 w-full ${
                  isActive(href) ? 'bg-gray-800 text-white' : ''
                }`}
              >
                <Icon />
                <span>{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerComponent;
