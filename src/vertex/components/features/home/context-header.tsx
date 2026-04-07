import React from "react";
import { useAppSelector } from "@/core/redux/hooks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { Info } from "lucide-react";

const ContextHeader = () => {
    const { userContext } = useUserContext();
    const activeGroup = useAppSelector((state) => state.user.activeGroup);
    const userDetails = useAppSelector((state) => state.user.userDetails);
    
    // Get user's first name, fallback to a generic greeting if not available
    const firstName = userDetails?.firstName || userDetails?.userName?.split('@')[0] || "User";

    const getContextTitle = () => {
        switch (userContext) {
            case "personal":
                return "your personal workspace";
            case "external-org":
                return activeGroup?.grp_title
                    ? `${activeGroup.grp_title.split("_").join(" ")} workspace`
                    : "organization workspace";
            default:
                return "Dashboard";
        }
    };

    const getContextDescription = () => {
        switch (userContext) {
            case "personal":
                return "Manage and monitor your personal devices.";
            case "external-org":
                return `View and manage all devices linked to the organization.`;
            default:
                return "Welcome to your dashboard.";
        }
    };

    return (
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#101828] mb-5">
                Hi, {firstName} 👋
            </h1>

            <div className="bg-[#EFF8FF] border border-[#B2DDFF] rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start">
                <div className="shrink-0 mt-0.5">
                    <Info className="w-5 h-5 text-[#2E90FA]" />
                </div>
                <p className="text-[#175CD3] text-sm md:text-[14px] leading-relaxed font-medium">
                    You&apos;re in <span className="capitalize">{getContextTitle()}.</span> {getContextDescription()}
                </p>
            </div>
        </div>
    );
};

export default ContextHeader;
