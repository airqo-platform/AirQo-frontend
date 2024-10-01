'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useMemo } from 'react';
// import { GoFileSubmodule } from 'react-icons/go';
import { RiAiGenerate } from 'react-icons/ri';
import { TbSettingsCog } from 'react-icons/tb';

import { Separator } from '@/components/ui/separator';
import AirQoLogo from '@/public/images/airqo.png';

interface LinkItem {
  href: string | string[];
  icon: React.ComponentType;
  label: string;
}

const links: LinkItem[] = [
  {
    href: ['/', '/home', '/help'],
    icon: RiAiGenerate,
    label: 'Home',
  },
  // { href: '/files', icon: GoFileSubmodule, label: 'Saved Files' },
  { href: '/settings', icon: TbSettingsCog, label: 'Settings' },
];

const SideBar: React.FC = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const pathname = usePathname();

  const isActive = (routes: string | string[]): boolean => {
    if (Array.isArray(routes)) {
      return routes.some((route) =>
        route === '/' ? pathname === route : pathname.startsWith(route),
      );
    }
    return routes === '/' ? pathname === routes : pathname.startsWith(routes);
  };

  const getLinkClassNames = (active: boolean) =>
    `flex flex-row rounded-lg items-center justify-start space-x-3 p-2 w-full ${
      active ? 'bg-gray-800 text-white' : ''
    }`;

  return (
    <div className="bg-blue-700 w-60 h-full hidden md:flex flex-col justify-between text-white shadow-md">
      <div>
        <div className="flex flex-row items-center justify-start space-x-3 p-4">
          <Image
            alt="AirQo Logo"
            src={AirQoLogo}
            priority
            className="rounded-full"
            width={50}
            height={50}
          />
          <h1 className="text-xl font-bold">AQ Report</h1>
        </div>
        <Separator className="bg-white" />
        <nav className="flex flex-col items-center space-y-3 justify-center p-4">
          {links.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link href={Array.isArray(href) ? href[0] : href} key={label} className="w-full">
                <div
                  className={getLinkClassNames(active)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      <footer className="p-4 text-center">
        <p className="text-sm">© {year} AQ Report</p>
        <small className="text-[10px]">Powered by AirQo</small>
      </footer>
    </div>
  );
};

export default memo(SideBar);
