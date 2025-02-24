"use client"; // Ensures this runs on the client

import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import type { LayoutProps } from "../app/types/layout";

export default function Layout({ children }: LayoutProps) {
    const [darkMode, setDarkMode] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const isDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(isDarkMode);
        document.documentElement.classList.toggle("dark", isDarkMode);

        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
            setIsSidebarCollapsed(window.innerWidth < 1024);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className={`flex h-screen bg-background ${darkMode ? "dark" : ""}`}>
            <Sidebar isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

            <div
                className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
                    isSidebarCollapsed ? "ml-0" : "ml-64"
                }`}
            >
                <Topbar isMobileView={isMobileView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6">
                    <div className="container mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
