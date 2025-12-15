import React, { useState } from "react";
import { useAppSelector } from "@/core/redux/hooks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { X } from "lucide-react";


const ContextHeader = () => {
    const { userContext } = useUserContext();
    const activeGroup = useAppSelector((state) => state.user.activeGroup);
    const [isVisible, setIsVisible] = useState(true);

    const getContextTitle = () => {
        switch (userContext) {
            case "personal":
                return "your space";
            case "external-org":
                return activeGroup?.grp_title.split("_").join(" ") || "Organization";
            default:
                return "Dashboard";
        }
    };

    const getContextDescription = () => {
        switch (userContext) {
            case "personal":
                return "Manage and monitor your personal devices. You can switch to an organisation view anytime";
            case "external-org":
                return `View and manage all devices linked to your organisation`;
            default:
                return "Welcome to your dashboard";
        }
    };

    if (!isVisible) return null;

    return (
        <div className="mb-8 relative overflow-hidden md:px-16 md:py-10 rounded-lg mx-auto bg-gradient-to-r from-primary to-primary/80 text-white p-8">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss header"
            >
                <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
                            You&apos;re in{" "}
                            <span className="capitalize">{getContextTitle()}! 👋</span>
                        </h1>
                    </div>
                    <p className="mt-2 text-lg text-white/90 max-w-2xl">
                        {getContextDescription()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContextHeader;
