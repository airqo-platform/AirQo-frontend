
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
import { AqPuzzlePiece02 } from "@airqo/icons-react";

interface DeviceCategoryCardProps {
    device: Device;
}

const DeviceCategoryCard: React.FC<DeviceCategoryCardProps> = ({ device }) => {
    const categories = device.device_categories;
    const isDeployed = !!categories?.deployment_category;

    if (!categories) return null;

    const Icon = isDeployed
        ? (categories.deployment_category?.toLowerCase().includes('mobile') ? Car : MapPin)
        : AqPuzzlePiece02;

    return (
        <Card className="w-full rounded-lg overflow-hidden relative min-h-[140px] flex items-center justify-center">
            <TooltipProvider>
                {/* --- Info Icon Tooltip --- */}
                {isDeployed && (
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
                            <p className="text-xs">{categories.category_relationships?.note}</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                <div className="flex flex-col p-6 space-y-4 w-full">
                    <div className="flex flex-col items-center text-center cursor-default">
                        <div className={`flex items-center gap-1.5 font-semibold ${isDeployed ? 'text-lg text-blue-700' : 'text-sm text-gray-500 flex-col gap-3'}`}>
                            <Icon className={isDeployed ? "w-5 h-5" : "w-12 h-12 text-gray-400"} />
                            {isDeployed ? (
                                <span className="capitalize">{categories.deployment_category} Device</span>
                            ) : (
                                <span className="max-w-[200px] leading-relaxed font-normal">
                                    Device not deployed. You will see deployment category here
                                </span>
                            )}
                        </div>

                        {isDeployed && (
                            <div className="text-sm text-muted-foreground mt-1">
                                {categories.category_hierarchy?.find(h => h.category === categories.deployment_category)?.description || 'Deployment Category'}
                            </div>
                        )}
                    </div>
                </div>
            </TooltipProvider>
        </Card>
    );
};

export default DeviceCategoryCard;
