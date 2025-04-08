"use client"; // Ensures this runs on the client

import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

interface LayoutProps {
    children: React.ReactNode;
    hideTopbar?: boolean;
    defaultCollapsed?: boolean;
}

export default function Layout({ 
    children, 
    hideTopbar = false,
    defaultCollapsed = false 
}: LayoutProps) {
    const [darkMode, setDarkMode] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const isDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(isDarkMode);
        document.documentElement.classList.toggle("dark", isDarkMode);

        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className={`flex h-screen overflow-hidden bg-background ${darkMode ? "dark" : ""}`}>
            <Sidebar
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <main className={`flex-1 flex flex-col bg-background transition-all duration-300 overflow-hidden ${
                isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
            }`}>
                {!hideTopbar && <Topbar isMobileView={isMobileView} toggleSidebar={toggleSidebar} />}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
