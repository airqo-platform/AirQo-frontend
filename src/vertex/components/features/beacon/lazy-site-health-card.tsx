"use client";

import dynamic from "next/dynamic";

// lazy-device-health-card.tsx explains why each card has its own lazy file.
const SiteHealthCard = dynamic(() => import("./site-health-card"), {
  ssr: false,
  loading: () => <div className="h-48 rounded-lg bg-muted animate-pulse" />,
});

export default SiteHealthCard;
