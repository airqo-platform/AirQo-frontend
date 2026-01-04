"use client";

import { Card } from "@/components/ui/card";
import { AqEdit01 } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";

interface Site {
  search_name?: string;
  location_name?: string;
  city?: string;
  country?: string;
}

interface SiteMobileAppCardProps {
  site: Site;
  onEdit?: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{label}</div>
    <div className="text-base font-normal break-words">{value || "N/A"}</div>
  </div>
);

export const SiteMobileAppCard: React.FC<SiteMobileAppCardProps> = ({ site, onEdit }) => {
  return (
    <Card className="w-full rounded-lg flex flex-col">
      <div className="px-3 py-2 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Mobile App Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailItem label="Editable Name" value={site.search_name} />
          <DetailItem label="Editable Description" value={site.location_name} />
          <DetailItem label="City" value={site.city} />
          <DetailItem label="Country" value={site.country} />
        </div>
      </div>
      {onEdit && (
        <div className="border-t border-t-gray-200 dark:border-t-gray-600 p-2 flex justify-end">
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