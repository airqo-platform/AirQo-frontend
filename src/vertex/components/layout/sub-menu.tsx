"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubMenuProps {
  label: string;
  icon: React.ElementType;
  href: string;
  isCollapsed: boolean;
  children: React.ReactNode;
}

const SubMenu: React.FC<SubMenuProps> = ({ label, icon: Icon, isCollapsed, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubMenu = () => {
    setIsOpen(!isOpen);
  };

  const content = (
    <button
      onClick={toggleSubMenu}
      className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all duration-200 w-full text-foreground hover:bg-accent hover:text-accent-foreground ${
        isCollapsed ? "justify-center" : "justify-between"
      }`}
    >
      <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
        <Icon size={18} className="shrink-0" />
        <span className={isCollapsed ? "hidden" : "block"}>{label}</span>
      </div>
      {!isCollapsed && (
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      )}
    </button>
  );

  return (
    <div className="space-y-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">{label}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {!isCollapsed && isOpen && (
        <div className="ml-6 space-y-1 border-l pl-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default SubMenu; 