'use client';

import React, { useState } from 'react';
import { X, LayoutGrid, ShieldCheck, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NavItem } from './NavItem';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useRecentlyVisited } from '@/core/hooks/useRecentlyVisited';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTE_LINKS } from '@/core/routes';
import { PERMISSIONS } from '@/core/permissions/constants';
import PermissionTooltip from '@/components/ui/permission-tooltip';

interface PrimarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

interface AdminDropdownItemProps {
  permission: boolean;
  permissionCode: string;
  tooltipMessage: string;
  onClick: () => void;
  label: string;
  subLabel: string;
  isActive: boolean;
}

const AdminDropdownItem: React.FC<AdminDropdownItemProps> = ({
  permission,
  permissionCode,
  tooltipMessage,
  onClick,
  label,
  subLabel,
  isActive,
}) => {
  const item = (
    <DropdownMenuItem
      disabled={!permission}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 p-3 cursor-pointer",
        isActive && "bg-blue-50 text-blue-700"
      )}
    >
      <span className="font-medium">{label}</span>
      <span className={cn("text-xs", isActive ? "text-blue-500" : "text-muted-foreground")}>
        {subLabel}
      </span>
    </DropdownMenuItem>
  );

  return (
    <span className="w-full h-full block">
      {!permission ? (
        <PermissionTooltip permission={permissionCode} message={tooltipMessage}>
          {item}
        </PermissionTooltip>
      ) : (
        item
      )}
    </span>
  );
};

const PrimarySidebar: React.FC<PrimarySidebarProps> = ({
  isOpen,
  onClose,
  activeModule,
  onModuleChange: handleModuleChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { getContextPermissions } = useUserContext();
  const permissions = getContextPermissions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const { visitedPages } = useRecentlyVisited();
  const { activeGroup } = useUserContext();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const recentTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Determine if user can view Admin Panel (Role based OR Permission based)
  const canViewAdminPanel = React.useMemo(() => {
    if (permissions.canViewNetworks) return true;
    if (!activeGroup?.role?.role_name) return false;

    const allowedRoles = ['AIRQO_SUPER_ADMIN', 'AIRQO_ADMIN', 'AIRQO_NETWORK_ADMIN'];
    return allowedRoles.includes(activeGroup.role.role_name);
  }, [permissions.canViewNetworks, activeGroup]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recentTimeoutRef.current) clearTimeout(recentTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999]" onClick={onClose} />
      )}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? '0%' : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 w-72 h-full bg-card shadow-lg z-[1000] flex flex-col p-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image
              src="/images/airqo_logo.svg"
              alt="Logo"
              width={40}
              height={40}
            />
            <span className="font-bold text-lg">Vertex</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          {/* Device Management - visible to ALL users */}
          <NavItem
            item={{
              href: ROUTE_LINKS.HOME,
              icon: LayoutGrid,
              label: 'Device Management',
              activeOverride: activeModule === 'devices',
            }}
            onClick={() => handleModuleChange('devices')}
          />

          {/* Administrative Panel - visible to authorized admin roles */}
          {canViewAdminPanel && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full"
                  onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    setIsDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsDropdownOpen(!isDropdownOpen);
                    }
                  }}
                >
                  <NavItem
                    item={{
                      href: '#', // Force dropdown usage
                      icon: ShieldCheck,
                      label: 'Administrative Panel',
                      activeOverride: activeModule === 'admin',
                      endIcon: isDropdownOpen ? ChevronDown : ChevronRight,
                    }}
                    onClick={(e) => { e?.preventDefault(); }}
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                className="w-64 ml-2 z-[1001]"
                align="start"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
                }}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Administrative Panel
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <AdminDropdownItem
                  permission={!!permissions.canViewNetworks}
                  permissionCode={PERMISSIONS.NETWORK.VIEW}
                  tooltipMessage="This action requires network view permission"
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push(ROUTE_LINKS.ADMIN_NETWORKS);
                    setIsDropdownOpen(false);
                  }}
                  label="Networks"
                  subLabel="Manage and configure networks"
                  isActive={pathname.startsWith(ROUTE_LINKS.ADMIN_NETWORKS)}
                />

                <AdminDropdownItem
                  permission={!!permissions.canViewDevices}
                  permissionCode={PERMISSIONS.DEVICE.VIEW}
                  tooltipMessage="This action requires device view permission"
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push(ROUTE_LINKS.COHORTS);
                    setIsDropdownOpen(false);
                  }}
                  label="Cohorts"
                  subLabel="Group devices for analytics"
                  isActive={pathname.startsWith(ROUTE_LINKS.COHORTS)}
                />

                <AdminDropdownItem
                  permission={!!permissions.canViewSites}
                  permissionCode={PERMISSIONS.SITE.VIEW}
                  tooltipMessage="This action requires site view permission"
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push(ROUTE_LINKS.SITES);
                    setIsDropdownOpen(false);
                  }}
                  label="Sites"
                  subLabel="Manage location deployments"
                  isActive={pathname.startsWith(ROUTE_LINKS.SITES)}
                />

                <AdminDropdownItem
                  permission={!!permissions.canViewSites}
                  permissionCode={PERMISSIONS.SITE.VIEW}
                  tooltipMessage="This action requires site view permission"
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push(ROUTE_LINKS.GRIDS);
                    setIsDropdownOpen(false);
                  }}
                  label="Grids"
                  subLabel="Configure spatial grids"
                  isActive={pathname.startsWith(ROUTE_LINKS.GRIDS)}
                />

                <AdminDropdownItem
                  permission={!!permissions.canViewShipping}
                  permissionCode={PERMISSIONS.SHIPPING.VIEW}
                  tooltipMessage="This action requires shipping view permission"
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push(ROUTE_LINKS.ADMIN_SHIPPING);
                    setIsDropdownOpen(false);
                  }}
                  label="Shipping"
                  subLabel="Track device logistics"
                  isActive={pathname.startsWith(ROUTE_LINKS.ADMIN_SHIPPING)}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Recently Visited - visible to ALL users */}
          {visitedPages.length > 0 && (
            <DropdownMenu open={isRecentOpen} onOpenChange={setIsRecentOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full"
                  onMouseEnter={() => {
                    if (recentTimeoutRef.current) clearTimeout(recentTimeoutRef.current);
                    setIsRecentOpen(true);
                  }}
                  onMouseLeave={() => {
                    recentTimeoutRef.current = setTimeout(() => setIsRecentOpen(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsRecentOpen(!isRecentOpen);
                    }
                  }}
                >
                  <NavItem
                    item={{
                      href: '#',
                      icon: Clock,
                      label: 'Recently Visited',
                      endIcon: isRecentOpen ? ChevronDown : ChevronRight,
                    }}
                    onClick={(e) => { e?.preventDefault(); }}
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                className="w-64 ml-2 z-[1001]"
                align="start"
                onMouseEnter={() => {
                  if (recentTimeoutRef.current) clearTimeout(recentTimeoutRef.current);
                }}
                onMouseLeave={() => {
                  recentTimeoutRef.current = setTimeout(() => setIsRecentOpen(false), 200);
                }}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Recently Visited
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {visitedPages.map((page, index) => (
                  <DropdownMenuItem
                    key={`${page.href}-${index}`}
                    onClick={() => {
                      // Detect module from href using route constants
                      if (page.href.startsWith('/devices')) {
                        handleModuleChange('devices');
                      } else if (page.href.startsWith('/admin')) {
                        handleModuleChange('admin');
                      }

                      router.push(page.href);
                      setIsRecentOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 cursor-pointer",
                      pathname === page.href && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <span className="font-medium">{page.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </motion.aside>
    </>
  );
};

export default PrimarySidebar;
