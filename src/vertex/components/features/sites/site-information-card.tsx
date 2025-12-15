"use client";

import { Site } from "@/app/types/sites";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AqEdit01 } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import {
  badgeColorClasses,
  formatDisplayDate,
  getDeviceStatus,
  getStatusExplanation,
} from "@/core/utils/status";

interface SiteInformationCardProps {
  site: Site;
  onEdit?: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{label}</div>
    <div className="text-base font-normal break-words">
      {value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "") ? value : "N/A"}
    </div>
  </div>
);

export const SiteInformationCard: React.FC<SiteInformationCardProps> = ({ site, onEdit }) => {
  const lastActiveCheck = site.lastActive
    ? formatDisplayDate(site.lastActive)
    : null;

  const status = getDeviceStatus(
    site.isOnline,
    site.rawOnlineStatus,
    lastActiveCheck
  );
  const colors = badgeColorClasses[status.color];
  const Icon = status.icon;
  const explanation = getStatusExplanation(status.label, lastActiveCheck);

  return (
    <Card className="w-full rounded-lg bg-white flex flex-col">
      <div className="px-3 py-2 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Site Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <DetailItem label="Name" value={site.name} />
          <DetailItem label="Description" value={site.description} />
          <DetailItem label="Network" value={site.network} />
          <DetailItem label="Latitude" value={<span className="font-mono">{site.latitude}</span>} />
          <DetailItem label="Longitude" value={<span className="font-mono">{site.longitude}</span>} />
          <DetailItem label="Parish" value={site.parish} />
          <DetailItem label="Sub County" value={site.sub_county} />
          <DetailItem label="District" value={site.district} />
          <DetailItem label="Region" value={site.region} />
          <DetailItem label="Altitude" value={`${site.altitude} m`} />
          <DetailItem label="Nearest Road" value={site.distance_to_nearest_road != null ? `${site.distance_to_nearest_road.toFixed(2)} m` : "N/A"} />
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Status</div>
            <div className="text-base font-normal">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help ${colors}`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {status.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      {onEdit && (
        <div className="border-t p-2 flex justify-end">
          <ReusableButton
            onClick={onEdit}
            Icon={AqEdit01}
            className="h-8 px-3 text-xs"
          >
            Edit
          </ReusableButton>
        </div>
      )}
    </Card>
  );
};