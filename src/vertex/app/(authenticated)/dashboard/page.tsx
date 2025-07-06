"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import PermissionTooltip from "@/components/ui/permission-tooltip";
import { DashboardStatsCards } from "@/components/features/dashboard/stats-cards";
import DashboardWelcomeBanner from "@/components/features/dashboard/DashboardWelcomeBanner";
import { useRouter } from "next/navigation";

const WelcomePage = () => {
    const activeGroup = useAppSelector((state) => state.user.activeGroup);
    const router = useRouter();

    const getOrgName = () => {
        if (!activeGroup) return "your organization";
        return activeGroup.grp_title.replace(/-/g, " ").replace(/_/g, " ").toUpperCase();
    };

    const actions = [
        {
            href: "/devices/deploy",
            label: "Deploy a Device",
            permission: PERMISSIONS.DEVICE.DEPLOY,
        },
        {
            href: "/sites",
            label: "Create a Site",
            permission: PERMISSIONS.SITE.CREATE,
        },
        {
            href: "/devices/claim",
            label: "Claim a Device",
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
            <DashboardWelcomeBanner />
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    You&apos;re working in <span className="font-semibold text-primary">{getOrgName()}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-10">
                <DashboardStatsCards />
            </div>

            {/* Quick Access Buttons */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {actions.map((action, idx) => {
                        const hasPermission = actionPermissions[idx];
                        const button = (
                            <Button
                                key={action.href}
                                variant="outline"
                                className="w-full gap-2 p-3 border-primary text-primary text-sm font-semibold hover:bg-primary/10 hover:text-primary focus:ring-primary"
                                disabled={!hasPermission}
                                onClick={() => {
                                    if (hasPermission) router.push(action.href);
                                }}
                            >
                                <PlusSquare className="h-7 w-7 text-primary" />
                                <span>{action.label}</span>
                            </Button>
                        );
                        if (hasPermission) {
                            return button;
                        } else {
                            return (
                                <PermissionTooltip key={action.href} permission={action.permission}>
                                    <span className="inline-block w-auto" tabIndex={0}>
                                        {button}
                                    </span>
                                </PermissionTooltip>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

export default WelcomePage; 