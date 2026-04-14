
import { Card } from "@/components/ui/card";
import { Info, Car, MapPin } from "lucide-react";
import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Device } from "@/app/types/devices";

interface DeviceCategoryCardProps {
    device: Device;
}

const DeviceCategoryCard: React.FC<DeviceCategoryCardProps> = ({ device }) => {
    const categories = device.device_categories;

    if (!categories) return null;

    const Icon = categories.deployment_category?.toLowerCase().includes('mobile') ? Car : MapPin;

    return (
        <Card className="w-full rounded-lg overflow-hidden relative">
            <TooltipProvider>
                {/* --- Info Icon Tooltip --- */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
                            aria-label="View category details"
                            type="button"
                        >
                            <Info className="w-4 h-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs" side="bottom">
                        <p className="text-sm font-medium mb-1">Mount Type</p>
                        <p className="text-xs">{categories.category_relationships.note}</p>
                    </TooltipContent>
                </Tooltip>

                <div className="flex flex-col pt-6 px-6 pb-6 space-y-4">
                    <div className="flex flex-col items-center text-center cursor-default">
                        <div className="flex items-center gap-1.5 text-lg font-semibold text-blue-700">
                            <Icon className="w-5 h-5" />
                            <span className="capitalize">{categories.deployment_category} Device</span>
                        </div>

                        <div className="text-sm text-muted-foreground mt-1">
                            {categories.category_hierarchy.find(h => h.category === categories.deployment_category)?.description || 'Deployment Category'}
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </Card>
    );
};

export default DeviceCategoryCard;
