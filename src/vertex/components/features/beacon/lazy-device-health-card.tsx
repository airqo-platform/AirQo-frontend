"use client";

import dynamic from "next/dynamic";

// Loaded on its own, like the data it shows, so the page never waits for it.
//
// Each card has its own lazy file on purpose. A module imported by exactly the device, cohort and
// site detail pages lets webpack put code those pages share with the device list pages (useDevices
// and others) into a chunk the list pages can't load, because they're at the initial chunk limit.
// Each list page then carries its own copy, which went over the bundle budget in package.json.
const DeviceHealthCard = dynamic(() => import("./device-health-card"), {
  ssr: false,
  loading: () => <div className="h-48 rounded-lg bg-muted animate-pulse" />,
});

export default DeviceHealthCard;
