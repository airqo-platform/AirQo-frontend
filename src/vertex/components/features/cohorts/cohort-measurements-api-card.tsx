"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface CohortMeasurementsApiCardProps {
    cohortId: string;
}

const CohortMeasurementsApiCard: React.FC<CohortMeasurementsApiCardProps> = ({ cohortId }) => {
    return (
        <Card className="w-full rounded-lg bg-white flex flex-col gap-4 px-3 py-2">
            <h2 className="text-lg font-semibold mb-2">Cohort Measurements API</h2>
            {/* Recent Measurements */}
            <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Recent Measurements API</div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {`https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}/recent?token=YOUR_TOKEN`}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-transparent"
                        aria-label="Copy recent cohort measurements API URL"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}/recent?token=YOUR_TOKEN`);
                                ReusableToast({ message: "Copied", type: "SUCCESS" });
                            } catch {
                                ReusableToast({ message: "Copy failed", type: "ERROR" });
                            }
                        }}
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            {/* Historical Measurements */}
            <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Historical Measurements API</div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {`https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}/historical?token=YOUR_TOKEN`}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-transparent"
                        aria-label="Copy historical cohort measurements API URL"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}/historical?token=YOUR_TOKEN`);
                                ReusableToast({ message: "Copied", type: "SUCCESS" });
                            } catch {
                                ReusableToast({ message: "Copy failed", type: "ERROR" });
                            }
                        }}
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default CohortMeasurementsApiCard;
