"use client"

import { TooltipTrigger } from "@/components/ui/tooltip"

import type React from "react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AqHomeSmile,
  AqMonitor,
  AqPackagePlus,
} from "@airqo/icons-react";
import { LogOut } from "lucide-react"

interface NavigationItem {
  href: string
  icon: React.ElementType
  label: string
  disabled?: boolean
}

interface BottomNavigationBarProps {
  items?: NavigationItem[]
  isLoading?: boolean
  maxItems?: number
  isMobileOpen?: boolean
}

const BottomNavItem = ({
  href,
  icon: Icon,
  label,
  disabled = false,
}: {
  href: string
  icon: React.ElementType
  label: string
  disabled?: boolean
}) => {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={disabled ? "#" : href}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]
                ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-muted text-foreground"}
                ${disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
          >
            {isActive && (
              <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-blue-600" />
            )}
            <Icon size={18} className="shrink-0" />
            <span className="text-xs text-center leading-tight">{label}</span>
          </Link>
        </TooltipTrigger>
        {disabled && <TooltipContent side="top">You do not have permission to access this.</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}
const navItems: NavigationItem[] = [
        {
                href:"/home",
                icon: AqHomeSmile,
                label: "Home",
        },
        {
                href:"/devices/my-devices",
                icon: AqMonitor,
                label: "My Devices"
        },
        {
                href:"/devices/claim",
                icon: AqPackagePlus,
                label: "claim"
        },
        {
                href:"/signout",
                icon: LogOut,
                label: "Sign out"
        }


];

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ items, isLoading = false, maxItems = 6,isMobileOpen }) => {
  const displayItems = items?.slice(0, maxItems)||navItems;

        if (!isMobileOpen) {
                return null;
        }

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-2 py-2">
          {isLoading ? (
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex justify-around items-center gap-1 overflow-x-auto">
              {displayItems?.map((item) => (
                <BottomNavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  disabled={item.disabled}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      <style jsx global>{`
        @media (max-width: 1023px) {
          body {
            padding-bottom: 70px;
          }
        }
      `}</style>
    </>
  )
}

export default BottomNavigationBar
