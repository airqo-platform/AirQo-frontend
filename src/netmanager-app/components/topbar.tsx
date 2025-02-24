"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCircle,
  LogOut,
  GridIcon,
  ExternalLink,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/core/hooks/users";

const Topbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { logout } = useAuth();

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

  const apps = [
    {
      name: "Calibrate",
      url: "/calibrate",
      description: "Device Calibration Tool",
    },
    { name: "Documentation", url: "/docs", description: "API & User Guides" },
    {
      name: "Analytics",
      url: "/analytics",
      description: "Advanced Analytics Platform",
    },
  ];

  return (
    <div className="h-16 border-b bg-background px-4 flex items-center justify-between">
      {/* Left side - can be used for breadcrumbs or other navigation */}
      <div></div>

      {/* Right side - Apps and Profile */}
      <div className="flex items-center gap-4">
        {/* Apps Navigation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-foreground"
            >
              <GridIcon size={20} />
              <span className="text-sm font-medium">Apps</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {apps.map((app) => (
              <DropdownMenuItem key={app.name} asChild>
                <Link href={app.url} className="flex items-center gap-3 p-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {app.description}
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground" />
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <UserCircle size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <UserCircle size={18} />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun size={18} className="mr-2" />
              ) : (
                <Moon size={18} className="mr-2" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut size={18} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Topbar;
