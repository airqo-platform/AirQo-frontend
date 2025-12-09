'use client';

import React, { useState } from 'react';
import { X, LayoutGrid, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NavItem } from './NavItem';
import { useUserContext } from '@/core/hooks/useUserContext';
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

interface PrimarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

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
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

          {/* Administrative Panel - visible to users with admin permissions */}
          {permissions.canViewNetworks && (
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

                <DropdownMenuItem
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push('/admin/networks');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    pathname.startsWith('/admin/networks') && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span className="font-medium">Networks</span>
                  <span className={cn("text-xs", pathname.startsWith('/admin/networks') ? "text-blue-500" : "text-muted-foreground")}>
                    Manage and configure networks
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push('/cohorts');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    pathname.startsWith('/cohorts') && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span className="font-medium">Cohorts</span>
                  <span className={cn("text-xs", pathname.startsWith('/cohorts') ? "text-blue-500" : "text-muted-foreground")}>
                    Group devices for analytics
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push('/sites');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    pathname.startsWith('/sites') && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span className="font-medium">Sites</span>
                  <span className={cn("text-xs", pathname.startsWith('/sites') ? "text-blue-500" : "text-muted-foreground")}>
                    Manage location deployments
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push('/grids');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    pathname.startsWith('/grids') && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span className="font-medium">Grids</span>
                  <span className={cn("text-xs", pathname.startsWith('/grids') ? "text-blue-500" : "text-muted-foreground")}>
                    Configure spatial grids
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    handleModuleChange('admin');
                    router.push('/admin/shipping');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    pathname.startsWith('/admin/shipping') && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span className="font-medium">Shipping</span>
                  <span className={cn("text-xs", pathname.startsWith('/admin/shipping') ? "text-blue-500" : "text-muted-foreground")}>
                    Track device logistics
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </motion.aside>
    </>
  );
};

export default PrimarySidebar;
