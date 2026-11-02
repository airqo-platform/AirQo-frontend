"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { SyncMenu } from "@/components/dashboard/sync-menu"
import { syncCohorts, syncThingSpeak } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"

interface SyncState {
  isSyncingCohorts: boolean
  isSyncingData: boolean
  handleSyncCohorts: () => Promise<void>
  handleSyncData: () => Promise<void>
}

export function useSyncActions(): SyncState {
  const [isSyncingCohorts, setIsSyncingCohorts] = useState(false)
  const [isSyncingData, setIsSyncingData] = useState(false)
  const { toast } = useToast()

  const runSync = async ({
    setLoading,
    action,
    successDescription,
    errorContext,
  }: {
    setLoading: (v: boolean) => void
    action: () => Promise<unknown>
    successDescription: string
    errorContext: string
  }) => {
    setLoading(true)
    try {
      await action()
      toast({
        title: "Sync successful",
        description: successDescription,
      })
    } catch (err) {
      console.error(`Error syncing ${errorContext}:`, err)
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: `An error occurred while syncing ${errorContext}.`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Clustered Analysis calls cohorts clusters
  const handleSyncCohorts = () =>
    runSync({
      setLoading: setIsSyncingCohorts,
      action: syncCohorts,
      successDescription: "Clusters synced successfully.",
      errorContext: "clusters",
    })

  const handleSyncData = () =>
    runSync({
      setLoading: setIsSyncingData,
      action: () => syncThingSpeak(14),
      successDescription: "ThingSpeak data synced for the last 14 days.",
      errorContext: "ThingSpeak data",
    })

  return {
    isSyncingCohorts,
    isSyncingData,
    handleSyncCohorts,
    handleSyncData,
  }
}

/** Clustered Analysis sync actions for the AirQo group, behind one icon. */
export function SyncToolbar({
  isSyncingCohorts,
  isSyncingData,
  handleSyncCohorts,
  handleSyncData,
}: SyncState) {
  const { activeGroup } = useGroup()
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo"

  if (!isAirqoGroup) {
    return null
  }
  return (
    <SyncMenu
      items={[
        {
          id: "clusters",
          label: "Sync Clusters",
          description: "From the AirQo platform",
          onSelect: handleSyncCohorts,
          busy: isSyncingCohorts,
        },
        {
          id: "data",
          label: "Sync Data",
          description: "ThingSpeak readings for the last 14 days",
          onSelect: handleSyncData,
          busy: isSyncingData,
        },
      ]}
    />
  )
}
