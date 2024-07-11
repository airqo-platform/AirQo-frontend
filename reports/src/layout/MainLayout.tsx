"use client";
import React from "react";
import SideBar from "../components/sidebar/SideBar";
import Header from "../components/header/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-row h-full w-full dark:bg-[#1a202c] dark:text-gray-300">
      <SideBar />
      <div className="flex flex-col flex-1 w-full overflow-y-auto">
        <Header />
        <div className="p-4 relative">{children}</div>
      </div>
    </div>
  );
}
