"use client";

import Topbar from "@/components/layout/topbar";
import Footer from "@/components/layout/Footer";

export default function OrgRequestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <Topbar onMenuClick={() => { }} />

            <div className="flex-1 overflow-y-auto flex flex-col mt-[64px]">
                <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 px-3 py-3 md:px-2 lg:py-6 lg:px-6">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
