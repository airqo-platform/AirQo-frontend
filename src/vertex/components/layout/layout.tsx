"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/core/redux/hooks";
import Topbar from "./topbar";
import PrimarySidebar from "./primary-sidebar";
import SecondarySidebar from "./secondary-sidebar";
import OrganizationLoadingState from "./loading/org-loading";
import SessionLoadingState from "./loading/session-loading";
import ErrorBoundary from "../shared/ErrorBoundary";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("network");
  const pathname = usePathname();
  const router = useRouter();
  
  const { isSwitching, switchingTo } = useAppSelector((state) => state.user.organizationSwitching);
  
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

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center overflow-hidden min-h-screen h-screen bg-background">
        <SessionLoadingState />
      </div>
    );
  }

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
        className={`flex-1 transition-all duration-300 ease-in-out bg-background w-full flex flex-col ${isSecondarySidebarCollapsed ? "lg:ml-[88px]" : "lg:ml-[256px]"} overflow-y-auto pt-[120px] sm:pt-[130px] md:pt-[140px] lg:pt-16 pb-20 md:pb-0
        }`}
      >
        <div className={`flex-1 w-full bg-background max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 px-3 py-3 md:px-2 lg:py-8 lg:px-8`}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
