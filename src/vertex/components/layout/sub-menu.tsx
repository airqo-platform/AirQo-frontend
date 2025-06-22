"use client";

import React from "react";
import Link from "next/link";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubMenuProps {
    isCollapsed: boolean;
    icon: React.ElementType;
    label: string;
    href: string;
    children: React.ReactNode;
}

const SubMenu: React.FC<SubMenuProps> = ({ isCollapsed, icon: Icon, label, href, children }) => {
    if (isCollapsed) {
        return (
            <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={href}>
                                    <Button variant="ghost" className="w-full justify-center p-2 h-9">
                                        <Icon size={18} className="shrink-0" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {label}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </HoverCardTrigger>
                <HoverCardContent side="right" align="start" className="ml-2 w-48 p-1">
                    <div className="text-sm font-semibold px-2 py-1.5">{label}</div>
                    <div className="flex flex-col space-y-1">
                        {children}
                    </div>
                </HoverCardContent>
            </HoverCard>
        );
    }

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                 <Link href={href}>
                     <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-9">
                         <Icon size={18} className="shrink-0" />
                        <span className="flex-grow text-left">{label}</span>
                        <ChevronRight size={16} className="shrink-0" />
                    </Button>
                 </Link>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="ml-2 w-48 p-1">
                <div className="flex flex-col space-y-1">
                    {children}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default SubMenu; 