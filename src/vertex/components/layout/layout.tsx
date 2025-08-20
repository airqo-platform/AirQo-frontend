"use client"; // Ensures this runs on the client

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/core/redux/hooks";
import Topbar from "./topbar";
import PrimarySidebar from "./primary-sidebar";
import SecondarySidebar from "./secondary-sidebar";
import OrganizationLoadingState from "./loading/org-loading";
import SessionLoadingState from "./loading/session-loading";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("network");
  const pathname = usePathname();
  const router = useRouter();
  const isMapPage = pathname === "/network-map";
  
  // Get organization switching state from Redux
  const { isSwitching, switchingTo } = useAppSelector((state) => state.user.organizationSwitching);
  
  // Get session loading state from Redux
  const isInitialized = useAppSelector((state) => state.user.isInitialized);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    if (
      pathname.startsWith("/user-management") ||
      pathname.startsWith("/organizations") ||
      pathname.startsWith("/access-control")
    ) {
      setActiveModule("admin");
    } else {
      setActiveModule("network");
    }
  }, [pathname]);

  // Auto-collapse secondary sidebar when on network map page
  useEffect(() => {
    if (isMapPage) {
      setIsSecondarySidebarCollapsed(true);
    }
  }, [isMapPage, pathname]);

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    setIsPrimarySidebarOpen(false);
    if (module === "admin") {
      router.push("/user-management");
    } else {
      router.push("/home");
    }
  };

  const toggleSecondarySidebar = () => {
    setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed);
  };

  // Show session loading state when session is not yet initialized
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center overflow-hidden min-h-screen h-screen bg-background">
        <SessionLoadingState />
      </div>
    );
  }

  // Show loading state when switching organizations
  if (isSwitching) {
    return (
      <div className="flex justify-center items-center overflow-hidden min-h-screen h-screen bg-background">
        <OrganizationLoadingState organizationName={switchingTo} />
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden min-h-screen h-screen bg-background">
      <Topbar onMenuClick={() => setIsPrimarySidebarOpen(true)} />
      <PrimarySidebar
        isOpen={isPrimarySidebarOpen}
        onClose={() => setIsPrimarySidebarOpen(false)}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      <SecondarySidebar
        isCollapsed={isSecondarySidebarCollapsed}
        toggleSidebar={toggleSecondarySidebar}
        activeModule={activeModule}
      />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out bg-background w-full flex flex-col ${isSecondarySidebarCollapsed ? "lg:ml-[88px]" : "lg:ml-[256px]"} ${
          isMapPage ? "overflow-hidden" : "overflow-y-auto"
        } pt-[120px] sm:pt-[130px] md:pt-[140px] lg:pt-16 ${
          !isMapPage ? "pb-20 md:pb-0" : ""
        }`}
      >
        <div className={`flex-1 w-full bg-background ${!isMapPage && "max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 px-3 py-3 md:px-2 lg:py-8 lg:px-8"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
