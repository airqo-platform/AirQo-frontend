"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { UserCircle, LogOut, GridIcon, Moon, Sun, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout as reduxLogout } from "@/core/redux/slices/userSlice";
import { useAppSelector } from "@/core/redux/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import OrganizationPicker from "../features/org-picker/organization-picker";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const [darkMode, setDarkMode] = useState(false)
  const currentUser = useAppSelector((state) => state.user.userDetails)
  const activeGroup = useAppSelector((state) => state.user.activeGroup)
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    localStorage.removeItem("activeNetwork");
    localStorage.removeItem("availableNetworks");
    localStorage.removeItem("activeGroup");
    localStorage.removeItem("userGroups");
    dispatch(reduxLogout());
    router.push("/login");
  };
  

  const apps = [
    {
      name: "Calibrate",
      url: "/calibrate",
      description: "Device Calibration Tool",
      icon: "⚙️",
    },
    {
      name: "Documentation",
      url: "/docs",
      description: "API & User Guides",
      icon: "📚",
    },
    {
      name: "Analytics",
      url: "/analytics",
      description: "Advanced Analytics Platform",
      icon: "📊",
    },
    {
      name: "Dashboard",
      url: "/dashboard",
      description: "Main Dashboard",
      icon: "🔍",
    },
  ]
  

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!currentUser) return "U"
    return `${currentUser.firstName?.charAt(0) || ""}${currentUser.lastName?.charAt(0) || ""}`.toUpperCase()
  }

  // Format user name
  const getUserName = () => {
    if (!currentUser) return "User"
    return `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.userName
  }

  return (
    <header className="flex h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-grow" />

        <div className="flex items-center gap-2 md:gap-4">
          <OrganizationPicker />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground md:gap-2"
                    >
                      <GridIcon className="h-5 w-5" />
                      <span className="hidden text-sm font-medium md:inline">Apps</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Applications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Applications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-2 gap-1 p-2">
                {apps.map((app) => (
                  <DropdownMenuItem
                    key={app.name}
                    asChild
                    className="flex h-24 flex-col items-center justify-center gap-1 p-3 text-center"
                  >
                    <Link href={app.url}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-lg">
                        {app.icon}
                      </div>
                      <div className="mt-1 text-xs font-medium">{app.name}</div>
                      <div className="text-[10px] text-muted-foreground">{app.description}</div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="justify-center text-center text-sm font-medium text-primary">
                <Link href="/apps">View all apps</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 md:pl-2 md:pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.profilePicture || ""} alt={getUserName()} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{getUserName()}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
              </div>
              <DropdownMenuSeparator />
              {currentUser?.organization && (
                <>
                  <div className="p-2">
                    <p className="text-xs font-medium leading-none text-muted-foreground">ORGANIZATION</p>
                    <p className="text-sm">
                      {activeGroup?.grp_title.replace(/-/g, " ").replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleDarkMode} className="flex items-center gap-2">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Topbar

