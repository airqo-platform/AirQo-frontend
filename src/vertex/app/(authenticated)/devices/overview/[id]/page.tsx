"use client";

import { useParams } from "next/navigation";
import DeviceDetailsLayout from "@/components/features/devices/device-details-layout";

export default function DeviceDetailsPage() {
  const params = useParams();
  const deviceId = params?.id as string;

  return <DeviceDetailsLayout deviceId={deviceId} />;
}
