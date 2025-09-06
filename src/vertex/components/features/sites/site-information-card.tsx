"use client";

import { Card } from "@/components/ui/card";

interface Site {
  name: string;
  description: string;
  network: string;
  latitude: number;
  longitude: number;
  parish: string;
  sub_county: string;
  district: string;
  region: string;
  altitude: number;
  distance_to_nearest_road?: number;
  isOnline: boolean;
}

interface SiteInformationCardProps {
  site: Site;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{label}</div>
    <div className="text-base font-normal break-words">{value || "N/A"}</div>
  </div>
);

export const SiteInformationCard: React.FC<SiteInformationCardProps> = ({ site }) => {
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
          <DetailItem label="Nearest Road" value={site.distance_to_nearest_road ? `${site.distance_to_nearest_road.toFixed(2)} m` : "N/A"} />
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Status</div>
            <div className="text-base font-normal">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  site.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {site.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};