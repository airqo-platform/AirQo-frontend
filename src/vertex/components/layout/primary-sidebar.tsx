'use client';

import type React from 'react';
import { X, LayoutGrid, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/core/redux/store';
import { NavItem } from './NavItem';

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
  const { userDetails } = useSelector((state: RootState) => state.user);
  const isAirQoInternalUser =
    userDetails?.email?.endsWith('@airqo.net') || false;

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
          <NavItem
            item={{
              href: '/home',
              icon: LayoutGrid,
              label: 'Network Management',
              activeOverride: activeModule === 'network',
            }}
            onClick={() => handleModuleChange('network')}
          />
          {isAirQoInternalUser && (
            <>
              <NavItem
                item={{
                  href: '/admin/networks',
                  icon: ShieldCheck,
                  label: 'Platform Administration',
                  activeOverride: activeModule === 'admin',
                }}
                onClick={() => handleModuleChange('admin')}
              />
            </>
          )}
        </nav>
      </motion.aside>
    </>
  );
};

export default PrimarySidebar;
