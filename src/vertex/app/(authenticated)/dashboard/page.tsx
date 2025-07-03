"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Radio } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import PermissionTooltip from "@/components/ui/permission-tooltip";

const WelcomePage = () => {
    const activeGroup = useAppSelector((state) => state.user.activeGroup);

    const getOrgName = () => {
        if (!activeGroup) return "your organization";
        return activeGroup.grp_title.replace(/-/g, " ").replace(/_/g, " ").toUpperCase();
    };

    const actions = [
        {
            href: "/devices/deploy",
            label: "Deploy a Device",
            icon: Radio,
            permission: PERMISSIONS.DEVICE.DEPLOY,
        },
        {
            href: "/sites",
            label: "Create a Site",
            icon: MapPin,
            permission: PERMISSIONS.SITE.CREATE,
        },
        {
            href: "/devices/claim",
            label: "Claim a Device",
            icon: Radio,
            permission: PERMISSIONS.DEVICE.UPDATE, // Device claiming requires update permission
        }
    ];

    // Precompute permissions for all actions (must call hooks at top level)
    const actionPermissions = [
        usePermission(PERMISSIONS.DEVICE.DEPLOY),
        usePermission(PERMISSIONS.SITE.CREATE),
        usePermission(PERMISSIONS.DEVICE.VIEW),
        usePermission(PERMISSIONS.SITE.CREATE),
        usePermission(PERMISSIONS.DEVICE.UPDATE),
    ];

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    You&apos;re working in <span className="font-semibold text-primary">{getOrgName()}</span>
                </p>
            </div>

            <div className="mb-10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {actions.map((action, idx) => {
                        const hasPermission = actionPermissions[idx];
                        const button = (
                            <Link href={hasPermission ? action.href : "#"} tabIndex={hasPermission ? 0 : -1} aria-disabled={!hasPermission}>
                                <Button 
                                    variant="outline" 
                                    className="h-20 w-full justify-start gap-4 p-4 text-left"
                                    disabled={!hasPermission}
                                >
                                    <action.icon className="h-8 w-8 text-primary" />
                                    <span className="text-md font-medium">{action.label}</span>
                                </Button>
                            </Link>
                        );
                        return hasPermission ? (
                            <span key={action.href}>{button}</span>
                        ) : (
                            <PermissionTooltip key={action.href} permission={action.permission}>
                                {button}
                            </PermissionTooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WelcomePage; 