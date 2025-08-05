"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Moon, Sun, BarChart2, BookOpen, LayoutDashboard, Settings } from "lucide-react"
import { AqMenu02, AqDotsGrid, AqUser02 } from '@airqo/icons-react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout as reduxLogout } from "@/core/redux/slices/userSlice";
import { useAppSelector } from "@/core/redux/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import OrganizationPicker from "../features/org-picker/organization-picker";
import Image from "next/image";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const [darkMode, setDarkMode] = useState(false)
  const currentUser = useAppSelector((state) => state.user.userDetails)
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
      icon: <Settings className="w-7 h-7 text-blue-600" />,
    },
    {
      name: "Documentation",
      url: "/docs",
      description: "API & User Guides",
      icon: <BookOpen className="w-7 h-7 text-green-600" />,
    },
    {
      name: "Analytics",
      url: "/analytics",
      description: "Advanced Analytics Platform",
      icon: <BarChart2 className="w-7 h-7 text-purple-600" />,
    },
    {
      name: "Dashboard",
      url: "/dashboard",
      description: "Main Dashboard",
      icon: <LayoutDashboard className="w-7 h-7 text-yellow-600" />,
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
    <header className="flex h-16 w-full z-40">
      <div className="flex w-full items-center justify-between px-4 bg-white rounded-2xl mx-1 mt-1 border border-gray-100">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <AqMenu02 size={48} color="#0A84FF" />
          </Button>
          <div className="h-12 w-12 overflow-hidden transition-all duration-300">
            <Image
              src="/images/airqo_logo.svg"
              alt="Logo"
              width={48}
              height={48}
              priority
              className="object-cover transition-opacity duration-500"
            />
          </div>          
          <span className="font-medium text-lg tracking-tight">Vertex</span>
        </div>

        <div className="flex items-center gap-x-1 ml-auto">
          <OrganizationPicker />

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 hover:text-foreground md:gap-2 p-0 m-0 rounded-full w-10 h-10"
                    >
                      <AqDotsGrid className="w-8 h-8 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Applications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl shadow-xl p-4 bg-white w-[320px] grid grid-cols-3 gap-3"
            >
              {apps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-blue-50 focus:bg-blue-100 transition"
                  title={app.description}
                >
                  {app.icon}
                  <span className="text-xs font-medium text-center">{app.name}</span>
                </a>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center cursor-pointer hover:bg-transparent p-0 m-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.profilePicture || ""} alt={getUserName()} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 px-2">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.profilePicture || ""} alt={getUserName()} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{getUserName().length > 18 ? getUserName().slice(0, 18) + "..." : getUserName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
              
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <AqUser02 className="h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={toggleDarkMode} className="flex items-center gap-2">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center"
                onClick={handleLogout}
              >
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

