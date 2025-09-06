"use client";

import { Card } from "@/components/ui/card";

interface Site {
  search_name: string;
  location_name: string;
  city: string;
  country: string;
}

interface SiteMobileAppCardProps {
  site: Site;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{label}</div>
    <div className="text-base font-normal break-words">{value || "N/A"}</div>
  </div>
);

export const SiteMobileAppCard: React.FC<SiteMobileAppCardProps> = ({ site }) => {
  return (
    <Card className="w-full rounded-lg bg-white flex flex-col">
      <div className="px-3 py-2 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Mobile App Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailItem label="Editable Name" value={site.search_name} />
          <DetailItem label="Editable Description" value={site.location_name} />
          <DetailItem label="City" value={site.city} />
          <DetailItem label="Country" value={site.country} />
        </div>
      </div>
    </Card>
  );
};