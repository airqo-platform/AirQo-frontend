"use client"

import { AqAlertTriangle, AqMarkerPin01, AqServer03, AqSignal01 } from "@airqo/icons-react"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { percentageOf, type DeviceCounts } from "@/lib/device-status"

interface DeviceSummaryCardsProps {
  counts: DeviceCounts
  isLoading?: boolean
}

/** Total, deployed, online and offline devices, as shown on Home and at the top of device lists. */
export function DeviceSummaryCards({ counts, isLoading = false }: Readonly<DeviceSummaryCardsProps>) {
  const trackedPercentage = percentageOf(counts.tracked, counts.total)
  const deployedPercentage = percentageOf(counts.deployed, counts.total)
  // Out of those two counts, not `tracked`: the API can report more offline devices than tracked
  // ones, which would otherwise read as an offline rate above 100%
  const reporting = counts.online + counts.offline
  const onlinePercentage = percentageOf(counts.online, reporting)
  const offlinePercentage = percentageOf(counts.offline, reporting)

  return (
    <div data-tour="device-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total & Tracked Devices */}
      <SummaryCard
        title="Total Devices"
        value={isLoading ? "..." : counts.total}
        icon={AqServer03}
        iconVariant="primary"
        secondaryLabel={`Tracked (${trackedPercentage}%)`}
        secondaryValue={isLoading ? "..." : counts.tracked}
        progressPercentage={trackedPercentage}
        progressVariant="primary"
        isLoading={isLoading}
      />

      {/* Deployed Devices */}
      <SummaryCard
        title="Deployed Devices"
        value={isLoading ? "..." : counts.deployed}
        icon={AqMarkerPin01}
        iconVariant="blue"
        secondaryLabel="of total devices"
        secondaryValue={`${deployedPercentage}%`}
        progressPercentage={deployedPercentage}
        progressVariant="blue"
        isLoading={isLoading}
      />

      {/* Online Devices */}
      <SummaryCard
        title="Online (Tracked)"
        value={isLoading ? "..." : counts.online}
        icon={AqSignal01}
        iconVariant="emerald"
        secondaryLabel="transmission rate"
        secondaryValue={`${onlinePercentage}%`}
        progressPercentage={onlinePercentage}
        progressVariant="emerald"
        isLoading={isLoading}
      />

      {/* Offline Devices */}
      <SummaryCard
        title="Offline (Tracked)"
        value={isLoading ? "..." : counts.offline}
        icon={AqAlertTriangle}
        iconVariant="rose"
        secondaryLabel="offline rate"
        secondaryValue={`${offlinePercentage}%`}
        progressPercentage={offlinePercentage}
        progressVariant="rose"
        isLoading={isLoading}
      />
    </div>
  )
}
