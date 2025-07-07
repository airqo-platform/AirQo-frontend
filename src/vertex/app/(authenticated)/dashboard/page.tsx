"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusSquare, User, Building2 } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import PermissionTooltip from "@/components/ui/permission-tooltip";
import { DashboardStatsCards } from "@/components/features/dashboard/stats-cards";
import DashboardWelcomeBanner from "@/components/features/dashboard/DashboardWelcomeBanner";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/core/hooks/useUserContext";
import { Permission } from "@/core/permissions/constants";

const WelcomePage = () => {
    const activeGroup = useAppSelector((state) => state.user.activeGroup);
    const router = useRouter();
    const { userContext, getSidebarConfig, isPersonalContext, isAirQoInternal, isExternalOrg } = useUserContext();
    const sidebarConfig = getSidebarConfig();

    const getContextTitle = () => {
        switch (userContext) {
            case 'personal':
                return 'My Monitors';
            case 'airqo-internal':
                return 'AirQo Organization';
            case 'external-org':
                return activeGroup?.grp_title || 'Organization';
            default:
                return 'Dashboard';
        }
    };

    const getContextDescription = () => {
        switch (userContext) {
            case 'personal':
                return 'Manage your personally claimed air quality monitoring devices';
            case 'airqo-internal':
                return 'Full access to AirQo organizational resources and team management';
            case 'external-org':
                return `Working within ${activeGroup?.grp_title || 'your organization'}`;
            default:
                return 'Welcome to your dashboard';
        }
    };

    const getContextIcon = () => {
        switch (userContext) {
            case 'personal':
                return <User className="h-6 w-6 text-blue-600" />;
            case 'airqo-internal':
                return <Building2 className="h-6 w-6 text-green-600" />;
            case 'external-org':
                return <Building2 className="h-6 w-6 text-purple-600" />;
            default:
                return <User className="h-6 w-6" />;
        }
    };

    const getContextActions = () => {
        const baseActions = [
            {
                href: "/devices/claim",
                label: "Claim a Device",
                permission: PERMISSIONS.DEVICE.UPDATE,
                showInPersonal: true,
                showInAirQoInternal: true,
                showInExternalOrg: false,
            }
        ];

        const airQoActions = [
            {
                href: "/devices/deploy",
                label: "Deploy a Device",
                permission: PERMISSIONS.DEVICE.DEPLOY,
                showInPersonal: false,
                showInAirQoInternal: true,
                showInExternalOrg: false,
            },
            {
                href: "/sites",
                label: "Create a Site",
                permission: PERMISSIONS.SITE.CREATE,
                showInPersonal: false,
                showInAirQoInternal: true,
                showInExternalOrg: true,
            }
        ];

        const externalOrgActions = [
            {
                href: "/sites",
                label: "Manage Sites",
                permission: PERMISSIONS.SITE.VIEW,
                showInPersonal: false,
                showInAirQoInternal: true,
                showInExternalOrg: true,
            }
        ];

        let actions: Array<{
            href: string;
            label: string;
            permission: Permission;
            showInPersonal: boolean;
            showInAirQoInternal: boolean;
            showInExternalOrg: boolean;
        }> = [...baseActions];

        if (isAirQoInternal) {
            actions = [...actions, ...airQoActions];
        }

        if (isExternalOrg) {
            actions = [...actions, ...externalOrgActions];
        }

        return actions.filter(action => {
            switch (userContext) {
                case 'personal':
                    return action.showInPersonal;
                case 'airqo-internal':
                    return action.showInAirQoInternal;
                case 'external-org':
                    return action.showInExternalOrg;
                default:
                    return true;
            }
        });
    };

    const actions = getContextActions();

    // Precompute permissions for all actions (must call hooks at top level)
    const actionPermissions = actions.map(action => 
        usePermission(action.permission)
    );

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <DashboardWelcomeBanner />
            
            {/* Context Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    {getContextIcon()}
                    <h1 className="text-4xl font-bold tracking-tight">{getContextTitle()}</h1>
                </div>
                <p className="mt-2 text-lg text-muted-foreground">
                    {getContextDescription()}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-10">
                <DashboardStatsCards />
            </div>

            {/* Quick Access Buttons */}
            {actions.length > 0 && (
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
            )}

            {/* Context-specific information */}
            {isPersonalContext && (
                <div className="mb-10 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Personal Context</h3>
                    <p className="text-blue-800">
                        You're viewing your personal monitors. Devices you claim will be visible here, 
                        even though they're technically assigned to the AirQo organization on the backend.
                    </p>
                </div>
            )}

            {isAirQoInternal && (
                <div className="mb-10 p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">AirQo Internal Access</h3>
                    <p className="text-green-800">
                        You have full organizational access as AirQo staff. You can manage all devices, 
                        sites, and team members within the AirQo organization.
                    </p>
                </div>
            )}

            {isExternalOrg && (
                <div className="mb-10 p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">External Organization</h3>
                    <p className="text-purple-800">
                        You're working within {activeGroup?.grp_title}. Your access is limited to 
                        features and resources available to your role in this organization.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WelcomePage; 