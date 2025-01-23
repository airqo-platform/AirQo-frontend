'use client';
import React from 'react';
import SideBar from '../components/sidebar/SideBar';
import Header from '../components/header/Header';
import NextTopLoader from 'nextjs-toploader';

interface LayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  return (
    <>
      <NextTopLoader
        color="#2299DD"
        initialPosition={0.08}
        crawlSpeed={200}
        height={4}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow={false}
        zIndex={1600}
        showAtBottom={false}
      />
      <div className="flex flex-row h-full w-full dark:bg-[#1a202c] dark:text-gray-300">
        <SideBar />
        <div className="flex flex-col flex-1 w-full overflow-y-auto">
          <Header />
          <div className="p-4 relative">{children}</div>
        </div>
      </div>
    </>
  );
}
