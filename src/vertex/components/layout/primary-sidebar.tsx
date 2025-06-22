"use client";

import type React from "react";
import { X, LayoutGrid, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { PermissionGuard } from "@/components/layout/accessConfig/permission-guard";

interface PrimarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const NavItem = ({
    icon: Icon,
    label,
    isActive,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full gap-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-3 rounded-md transition-all duration-200 ${
            isActive ? "bg-accent text-accent-foreground" : ""
        }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
);


const PrimarySidebar: React.FC<PrimarySidebarProps> = ({ isOpen, onClose, activeModule, onModuleChange }) => {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />}
            <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? "0%" : "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 w-72 h-full bg-card shadow-lg z-50 flex flex-col p-4"
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
                        icon={LayoutGrid} 
                        label="Network Management"
                        isActive={activeModule === 'network'}
                        onClick={() => onModuleChange('network')}
                    />
                    <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
                        <NavItem
                            icon={ShieldCheck}
                            label="Platform Administration"
                            isActive={activeModule === 'admin'}
                            onClick={() => onModuleChange('admin')}
                        />
                    </PermissionGuard>
                </nav>
            </motion.aside>
        </>
    );
};

export default PrimarySidebar; 