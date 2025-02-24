"use client";

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/core/hooks/users"
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks"
import { setActiveNetwork, setActiveGroup } from "@/core/redux/slices/userSlice"
import type { Group, Network } from "@/app/types/users"
import DesktopSidebar from "./desktop-sidebar"
import MobileSidebar from "./mobile-sidebar"

interface AppSidebarProps {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<AppSidebarProps> = ({ isSidebarCollapsed, toggleSidebar }) => {
  const pathname = usePathname()
  const [userCollapsed, setUserCollapsed] = useState(false)
  const [isDevicesOpen, setIsDevicesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { logout } = useAuth()
  const dispatch = useAppDispatch()

  const availableNetworks = useAppSelector((state) => state.user.availableNetworks)
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork)
  const activeGroup = useAppSelector((state) => state.user.activeGroup)
  const userGroups = useAppSelector((state) => state.user.userGroups)

  const isActive = (path: string) => pathname?.startsWith(path)
  const isDevicesActive = isActive("/devices")

  useEffect(() => {
    if (isDevicesActive && !userCollapsed) {
      setIsDevicesOpen(true)
    } else if (!isDevicesActive) {
      setUserCollapsed(false)
    }
  }, [isDevicesActive, userCollapsed])

  const handleDevicesToggle = (open: boolean) => {
    setIsDevicesOpen(open)
    if (isDevicesActive) {
      setUserCollapsed(!open)
    }
  }

  const handleNetworkChange = (network: Network) => {
    dispatch(setActiveNetwork(network))
    localStorage.setItem("activeNetwork", JSON.stringify(network))
  }

  const handleOrganizationChange = (group: Group) => {
    dispatch(setActiveGroup(group))
    localStorage.setItem("activeGroup", JSON.stringify(group))
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  useEffect(() => {
    if (isSidebarCollapsed) {
      setIsMobileMenuOpen(false);
    }
  }, [isSidebarCollapsed]);

  return (
    <>
      <Button variant="ghost" size="icon" className=" fixed top-4 left-4 z-50 md:hidden" onClick={toggleMobileMenu}>
        <Menu />
      </Button>

      <div className="hidden md:block">
      <DesktopSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isDevicesOpen={isDevicesOpen}
        handleDevicesToggle={handleDevicesToggle}
        activeGroup={activeGroup}
        userGroups={userGroups}
        handleOrganizationChange={handleOrganizationChange}
        activeNetwork={activeNetwork}
        availableNetworks={availableNetworks}
        handleNetworkChange={handleNetworkChange}
        isActive={isActive}
        logout={logout}
      />
      </div>

      <div
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      >
      <MobileSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        isDevicesOpen={isDevicesOpen}
        handleDevicesToggle={handleDevicesToggle}
        activeGroup={activeGroup}
        userGroups={userGroups}
        handleOrganizationChange={handleOrganizationChange}
        activeNetwork={activeNetwork}
        availableNetworks={availableNetworks}
        handleNetworkChange={handleNetworkChange}
        isActive={isActive}
        logout={logout}
      />
      </div>

    </>
  )
}

export default Sidebar

