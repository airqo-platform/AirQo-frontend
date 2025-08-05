"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  BarChart2,
  BookOpen,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { AqMenu02, AqDotsGrid, AqUser02 } from "@airqo/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout as reduxLogout } from "@/core/redux/slices/userSlice";
import { useAppSelector } from "@/core/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import OrganizationPicker from "../features/org-picker/organization-picker";
import Image from "next/image";
import Card from "../shared/card/CardWrapper";

interface TopbarProps {
  onMenuClick: () => void;
}

const AirqoLogoRaw = "/images/airqo_logo.svg";

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const [darkMode, setDarkMode] = useState(false);
  const currentUser = useAppSelector((state) => state.user.userDetails);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
  ];

  const handleLogoClick = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const LogoComponent = useCallback(
    ({ className = "", buttonProps = {} }) => (
      <Button
        onClick={handleLogoClick}
        variant="ghost"
        className={`inline-flex items-center justify-center p-0 m-0 ${className}`}
        {...buttonProps}
      >
        <Image
          src={AirqoLogoRaw}
          alt="AirQo logo"
          width={48}
          height={48}
          priority
          className="object-cover transition-opacity duration-500"
        />
      </Button>
    ),
    [handleLogoClick]
  );

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!currentUser) return "U";
    return `${currentUser.firstName?.charAt(0) || ""}${
      currentUser.lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // Format user name
  const getUserName = () => {
    if (!currentUser) return "User";
    return (
      `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
      currentUser.userName
    );
  };

  return (
    <header className="fixed flex flex-col gap-2 px-1 md:px-2 py-1 top-0 left-0 right-0 z-[999]">
      <Card className={`w-full bg-white`} padding="py-1 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onMenuClick}
              className="inline-flex items-center justify-center focus:outline-none min-h-[32px]"
            >
              <span>
                <AqMenu02 size={20} color="#0A84FF" />
              </span>
            </Button>
            <LogoComponent
              className={`flex items-center justify-center text-gray-800`}
            />
            <span className="font-medium text-lg tracking-tight">Vertex</span>
          </div>

          <div className="flex items-center gap-x-1 ml-auto">
            <OrganizationPicker />

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`p-2 rounded-full transition hover:bg-gray-100`}
                      >
                        <AqDotsGrid className="w-6 h-6 text-gray-600" />
                      </button>
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
                    <span className="text-xs font-medium text-center">
                      {app.name}
                    </span>
                  </a>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center cursor-pointer hover:bg-transparent p-0 m-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={currentUser?.profilePicture || ""}
                      alt={getUserName()}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 px-2">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={currentUser?.profilePicture || ""}
                      alt={getUserName()}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {getUserName().length > 18
                        ? getUserName().slice(0, 18) + "..."
                        : getUserName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email}
                    </p>
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

                <DropdownMenuItem
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2"
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
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
      </Card>
    </header>
  );
};

export default Topbar;
