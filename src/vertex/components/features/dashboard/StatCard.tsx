"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: React.ReactNode;
    isLoading?: boolean;
    variant?: "default" | "success" | "warning" | "destructive" | "info" | "primary";
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
    isActive?: boolean;
}

export const StatCard = ({
    title,
    value,
    description,
    icon,
    isLoading,
    variant = "default",
    size = "md",
    onClick,
    isActive = false,
}: StatCardProps) => {
    const getContainerStyles = useCallback(() => {
        const baseStyles = "rounded-lg border bg-white dark:bg-gray-800 relative overflow-hidden p-0 transition-all duration-200";
        
        if (isLoading) {
            return baseStyles;
        }

        const interactiveStyles = onClick ? "cursor-pointer hover:shadow-md hover:border-primary/50" : "";
        const activeStyles = isActive ? "ring-2 ring-primary border-primary shadow-md" : "";
        return cn(baseStyles, interactiveStyles, activeStyles);
    }, [onClick, isActive, isLoading]);

    const getIconColor = useCallback(() => {
        switch (variant) {
            case "success":
                return "text-green-500 bg-green-50 dark:bg-green-900/10";
            case "warning":
                return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
            case "destructive":
                return "text-red-500 bg-red-50 dark:bg-red-900/10";
            case "info":
                return "text-blue-500 bg-blue-50 dark:bg-blue-900/10";
            case "primary":
                return "text-primary bg-primary/10";
            default:
                return "text-gray-500 bg-gray-50 dark:bg-gray-900/10";
        }
    }, [variant]);

    // Size configurations
    const sizeConfig = {
        sm: {
            padding: "p-3",
            gap: "gap-2",
            titleSize: "text-sm",
            valueSize: "text-xl",
            iconContainer: "p-1.5 rounded-lg",
            iconSize: "w-4 h-4",
        },
        md: {
            padding: "p-4",
            gap: "gap-4",
            titleSize: "text-md",
            valueSize: "text-3xl",
            iconContainer: "p-2 rounded-xl",
            iconSize: "w-6 h-6",
        },
        lg: {
            padding: "p-6",
            gap: "gap-6",
            titleSize: "text-lg",
            valueSize: "text-4xl",
            iconContainer: "p-3 rounded-2xl",
            iconSize: "w-8 h-8",
        },
    };

    const config = sizeConfig[size];

    if (isLoading) {
        return (
            <div className="md:col-span-1 lg:col-span-1">
                <Card className={getContainerStyles()}>
                    <CardContent className={cn("flex flex-col h-full justify-between", config.padding, config.gap)}>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            {description && <Skeleton className="h-4 w-4 rounded-full" />}
                        </div>
                        <Skeleton className="h-10 w-16" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Clone icon to apply size classes if it's a valid element
    // But since we pass icon as a node, we might need to wrap it or expect correct size
    // For flexibility, we'll suggest passing icon with correct size or override here if possible
    // Using a wrapper div to constrain size might be safer if the icon is SVG

    return (
        <div className="md:col-span-1 lg:col-span-1 h-full">
            <Card
                className={getContainerStyles()}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (onClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onClick();
                    }
                }}
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                aria-label={onClick ? `View ${title.toLowerCase()}` : undefined}
            >
                <CardContent className={cn("flex flex-col h-full justify-between", config.padding, config.gap)}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <h5 className={cn("font-medium text-muted-foreground", config.titleSize)}>
                                {title}
                            </h5>
                            {description && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-3 h-3 text-gray-400 cursor-help hover:text-primary transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs text-xs">{description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className={cn("font-bold text-foreground", config.valueSize)}>
                            {value}
                        </span>
                        <div className={cn(config.iconContainer, getIconColor())}>
                            {icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
