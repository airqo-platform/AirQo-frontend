'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import AirQoLogo from '@/public/images/airqo.png';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { TbSettingsCog } from 'react-icons/tb';
import { RiAiGenerate } from 'react-icons/ri';

const links = [
  {
    href: ['/', '/home'],
    icon: RiAiGenerate,
    label: 'Home',
  },
  // { href: "/files", icon: SiFiles, label: "Saved Files" },
  { href: '/settings', icon: TbSettingsCog, label: 'Settings' },
];

export default function SideBar() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const isActive = (routes: string | string[]) => {
    if (Array.isArray(routes)) {
      return routes.some((route) =>
        route === '/' ? pathname === route : pathname.startsWith(route),
      );
    }
    return routes === '/' ? pathname === routes : pathname.startsWith(routes);
  };

  return (
    <div className="bg-blue-700 w-60 h-full hidden md:flex flex-col justify-between text-white shadow-md">
      <div>
        <div className="flex flex-row items-center justify-start space-x-3 p-4">
          <Image
            alt="Logo"
            src={AirQoLogo}
            priority
            className="rounded-full"
            width={50}
            height={50}
          />
          <h1 className="text-xl font-bold">AQ Report</h1>
        </div>
        <Separator className="bg-white" />
        <div className="flex flex-col items-center space-y-3 justify-center p-4">
          {links.map(({ href, icon: Icon, label }) => (
            <Link href={Array.isArray(href) ? href[0] : href} className="w-full" key={label}>
              <span
                className={`flex flex-row rounded-lg items-center justify-start space-x-3 p-2 w-full  ${
                  isActive(href) ? 'bg-gray-800 text-white' : ''
                }`}
              >
                <Icon />
                <span>{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="p-4 text-center">
        <p className="text-center text-sm">© {year} AQ Report</p>
        <small className="text-[10px]">Powered by AirQo</small>
      </div>
    </div>
  );
}
