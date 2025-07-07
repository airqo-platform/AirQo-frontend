"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ChevronDown, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserContext } from "@/core/hooks/useUserContext";
import { setUserContext } from "@/core/redux/slices/userSlice";
import { UserContext } from "@/core/redux/slices/userSlice";

interface ContextSwitcherProps {
  className?: string;
}

const ContextSwitcher: React.FC<ContextSwitcherProps> = ({ className }) => {
  const dispatch = useDispatch();
  const { userContext, canSwitchContext, isAirQoStaff } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!canSwitchContext || !isAirQoStaff) {
    return null;
  }

  const handleContextChange = (newContext: UserContext) => {
    dispatch(setUserContext(newContext));
    setIsOpen(false);
  };

  const getCurrentContextLabel = () => {
    switch (userContext) {
      case 'personal':
        return 'Personal View';
      case 'airqo-internal':
        return 'AirQo Organization';
      default:
        return 'Select Context';
    }
  };

  const getCurrentContextIcon = () => {
    switch (userContext) {
      case 'personal':
        return <User size={16} />;
      case 'airqo-internal':
        return <Building2 size={16} />;
      default:
        return <User size={16} />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
        >
          {getCurrentContextIcon()}
          <span className="hidden sm:inline">{getCurrentContextLabel()}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleContextChange('personal')}
          className={`flex items-center gap-2 ${
            userContext === 'personal' ? 'bg-accent' : ''
          }`}
        >
          <User size={16} />
          <div className="flex flex-col">
            <span className="font-medium">Personal View</span>
            <span className="text-xs text-muted-foreground">
              Manage your claimed devices
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleContextChange('airqo-internal')}
          className={`flex items-center gap-2 ${
            userContext === 'airqo-internal' ? 'bg-accent' : ''
          }`}
        >
          <Building2 size={16} />
          <div className="flex flex-col">
            <span className="font-medium">AirQo Organization</span>
            <span className="text-xs text-muted-foreground">
              Full organizational access
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContextSwitcher; 