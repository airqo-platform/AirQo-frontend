'use client';

import type React from 'react';
import { X, LayoutGrid, ShieldCheck, Building2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NavItem } from './NavItem';
import { useUserContext } from '@/core/hooks/useUserContext';

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
  const { userScope, isOrganisationScope, getContextPermissions } = useUserContext();
  const permissions = getContextPermissions();

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
              href: '/home',
              icon: LayoutGrid,
              label: 'Device Management',
              activeOverride: activeModule === 'devices',
            }}
            onClick={() => handleModuleChange('devices')}
          />

          {/* Organisation Devices - visible to users with organisation scope */}
          {isOrganisationScope && (
            <NavItem
              item={{
                href: '/devices/overview',
                icon: Building2,
                label: 'Organisation Devices',
                activeOverride: activeModule === 'org-devices',
              }}
              onClick={() => handleModuleChange('org-devices')}
            />
          )}

          {/* Network Management - visible to users with network permissions */}
          {isOrganisationScope && permissions.canViewNetworks && (
            <NavItem
              item={{
                href: '/admin/networks',
                icon: Network,
                label: 'Network Management',
                activeOverride: activeModule === 'network-mgmt',
              }}
              onClick={() => handleModuleChange('network-mgmt')}
            />
          )}

          {/* Platform Administration - visible to super admins */}
          {permissions.canViewNetworks && (
            <NavItem
              item={{
                href: '/admin/shipping',
                icon: ShieldCheck,
                label: 'Platform Administration',
                activeOverride: activeModule === 'admin',
              }}
              onClick={() => handleModuleChange('admin')}
            />
          )}
        </nav>
      </motion.aside>
    </>
  );
};

export default PrimarySidebar;
