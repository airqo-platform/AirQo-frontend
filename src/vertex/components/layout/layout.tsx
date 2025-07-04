"use client"; // Ensures this runs on the client

import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import Topbar from "./topbar";
import PrimarySidebar from "./primary-sidebar";
import SecondarySidebar from "./secondary-sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ 
    children, 
}: LayoutProps) {
    const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
    const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(false);
    const [activeModule, setActiveModule] = useState("network");
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname.startsWith('/user-management') || pathname.startsWith('/organizations') || pathname.startsWith('/access-control')) {
            setActiveModule('admin');
        } else {
            setActiveModule('network');
        }
    }, [pathname]);

    // Auto-collapse secondary sidebar when on network map page
    useEffect(() => {
        if (pathname === '/network-map') {
            setIsSecondarySidebarCollapsed(true);
        }
    }, [pathname]);

    const handleModuleChange = (module: string) => {
        setActiveModule(module);
        setIsPrimarySidebarOpen(false);
        if (module === 'admin') {
            router.push('/user-management'); 
        } else {
            router.push('/dashboard');
        }
    };

    const toggleSecondarySidebar = () => {
        setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed);
    }

    return (
        <div className="flex h-screen bg-muted/40">
            <PrimarySidebar
                isOpen={isPrimarySidebarOpen}
                onClose={() => setIsPrimarySidebarOpen(false)}
                activeModule={activeModule}
                onModuleChange={handleModuleChange}
            />

            <div className="flex flex-col flex-1">
                <Topbar onMenuClick={() => setIsPrimarySidebarOpen(true)} />
                <div className="flex flex-1 overflow-hidden">
                    <SecondarySidebar
                        isCollapsed={isSecondarySidebarCollapsed}
                        toggleSidebar={toggleSecondarySidebar}
                        activeModule={activeModule}
                    />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
