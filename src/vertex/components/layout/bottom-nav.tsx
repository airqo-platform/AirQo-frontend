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
import { useAuth } from '@/core/hooks/users';
import { useUserContext } from "@/core/hooks/useUserContext"

interface NavigationItem {
  href: string
  icon: React.ElementType
  label: string
  disabled?: boolean
}

interface BottomNavigationBarProps {
  isMobileOpen?: boolean
}

const BottomNavItem = ({
  href,
  icon: Icon,
  label,
  disabled = false,
  onClick,
}: {
  href?: string
  icon: React.ElementType
  label: string
  disabled?: boolean
  onClick?: () => void
}) => {
  const pathname = usePathname()
  const isActive = href ? pathname.startsWith(href) : false

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
         {disabled ? (
                <span
              tabIndex={-1}
              aria-disabled={true}
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] opacity-50 cursor-not-allowed text-foreground"
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-xs text-center leading-tight">{label}</span>
            </span>
          ) : (href ? (
            <Link
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]
                ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-muted text-foreground"}`}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-blue-600" />
              )}
              <Icon size={18} className="shrink-0" />
              <span className="text-xs text-center leading-tight">{label}</span>
            </Link>
          ):(
                <button 
                onClick={onClick}
                className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]
                ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-muted text-foreground"}`} >
              {isActive && (
                <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-blue-600" />
              )}
              <Icon size={18} className="shrink-0" />
              <span className="text-xs text-center leading-tight">{label}</span>
                </button>
          ))}

        </TooltipTrigger>
        {disabled && <TooltipContent side="top">You do not have permission to access this.</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}
const baseItems = {
  home: { href: "/home", icon: AqHomeSmile, label: "Home" },
  myDevices: { href: "/devices/my-devices", icon: AqMonitor, label: "My Devices" },
  devicesOverview: { href: "/devices/overview", icon: AqMonitor, label: "Devices" },
  claim: { href: "/devices/claim", icon: AqPackagePlus, label: "Claim" },
};

const itemsByContext: Record<string, NavigationItem[]> = {
  "personal": [baseItems.home, baseItems.myDevices, baseItems.claim],
  "airqo-internal": [baseItems.home, baseItems.devicesOverview, baseItems.claim],
  "external-org": [baseItems.home, baseItems.devicesOverview, baseItems.claim],
};


const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ isMobileOpen }) => {
  
        const {userContext,isContextLoading} = useUserContext();
        const { logout } = useAuth();
        let displayItems: NavigationItem[] = [];
        switch (userContext) {
                case "personal":
                        displayItems = itemsByContext["personal"] || [];
                        break;
        case "airqo-internal":
                        displayItems = itemsByContext["airqo-internal"] || [];
                        break;
        case "external-org":
                        displayItems = itemsByContext["external-org"] || [];
                        break;
        default:
                displayItems = itemsByContext["personal"] || [];
        }


        if (!isMobileOpen) {
                return null;
        }

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-2 py-2">
          {isContextLoading ? (
            <div className="flex justify-center gap-2">
              {[...Array(4)].map((_, i) => (
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
              <BottomNavItem
                  onClick={logout}
                  icon={LogOut}
                  label="Sign out"
                  disabled={false}
                />
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
