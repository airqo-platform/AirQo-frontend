"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { UserCircle, LogOut, GridIcon, Moon, Sun, Menu, Settings, Bell, HelpCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/core/hooks/users"
import { useAppSelector } from "@/core/redux/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TopbarProps {
  isMobileView: boolean
  toggleSidebar?: () => void
}

const Topbar: React.FC<TopbarProps> = ({ isMobileView, toggleSidebar }) => {
  const [darkMode, setDarkMode] = useState(false)
  const { logout } = useAuth()
  const currentUser = useAppSelector((state) => state.user.userDetails)

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
    <header className="sticky top-0 z-30 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full items-center justify-between px-4">
        {isMobileView && toggleSidebar && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        {/* Left side - can add logo or breadcrumbs here */}
        <div className="flex items-center gap-2">
        </div>

        {/* Right side - actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & Resources</TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          {/* <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notifications</span>
                      <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[10px]">3</Badge>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-normal text-primary">
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start p-3">
                    <div className="flex w-full items-center gap-2">
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="h-2 w-2 rounded-full bg-blue-500 p-0" />
                      </div>
                      <div className="flex-1 text-sm font-medium">Device status update</div>
                      <div className="text-xs text-muted-foreground">2h ago</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Device AQ-045 is now online and transmitting data.
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="justify-center text-center text-sm font-medium text-primary">
                <Link href="/notifications">View all notifications</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

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
                <div className="hidden flex-col items-start text-left md:flex">
                  <span className="text-sm font-medium leading-none">{getUserName()}</span>
                  <span className="text-xs text-muted-foreground">
                    {currentUser?.organization || currentUser?.email}
                  </span>
                </div>
                <ChevronDown className="hidden h-4 w-4 opacity-50 md:inline-block" />
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
                    <p className="text-sm">{currentUser.organization}</p>
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
                onClick={logout}
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

