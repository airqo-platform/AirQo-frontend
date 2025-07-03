"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, Grid, Radio } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { PermissionGuard } from "@/components/layout/accessConfig/permission-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

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
            href: "/cohorts",
            label: "Create a Cohort",
            icon: Layers,
            permission: PERMISSIONS.DEVICE.VIEW, // Cohorts fall under devices
        },
        {
            href: "/grids",
            label: "Create a Grid",
            icon: Grid,
            permission: PERMISSIONS.SITE.CREATE, // Grids fall under sites
        },
        {
            href: "/devices/claim",
            label: "Claim a Device",
            icon: Radio,
            permission: PERMISSIONS.DEVICE.UPDATE, // Device claiming requires update permission
        }
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
                    {actions.map((action) => (
                         <PermissionGuard key={action.href} permission={action.permission}>
                            <Link href={action.href}>
                                <Button variant="outline" className="h-20 w-full justify-start gap-4 p-4 text-left">
                                    <action.icon className="h-8 w-8 text-primary" />
                                    <span className="text-md font-medium">{action.label}</span>
                                </Button>
                            </Link>
                        </PermissionGuard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WelcomePage; 