'use client';
import NextTopLoader from 'nextjs-toploader';
import React from 'react';

import Header from './header';
import SideBar from './sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

// Configuration for NextTopLoader
const loaderConfig = {
  color: '#1e40af',
  initialPosition: 0.08,
  crawlSpeed: 200,
  height: 4,
  crawl: true,
  showSpinner: false,
  easing: 'ease',
  speed: 200,
  shadow: false as string | false,
  zIndex: 1600,
  showAtBottom: false,
};

export default function MainLayout({ children }: LayoutProps) {
  return (
    <>
      <NextTopLoader {...loaderConfig} />
      <div className="flex flex-row h-screen w-full dark:bg-[#1a202c] dark:text-gray-300">
        <SideBar />
        <main className="flex flex-col flex-1 w-full overflow-y-auto">
          <Header />
          <div className="p-4 max-w-7xl w-full mx-auto relative">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
