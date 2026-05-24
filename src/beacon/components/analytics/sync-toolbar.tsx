"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { syncCohorts, syncGrids, syncThingSpeak } from "@/services/device-api.service"

interface SyncState {
  isSyncingCohorts: boolean
  isSyncingGrids: boolean
  isSyncingData: boolean
  handleSyncCohorts: () => Promise<void>
  handleSyncGrids: () => Promise<void>
  handleSyncData: () => Promise<void>
}

export function useSyncActions(): SyncState {
  const [isSyncingCohorts, setIsSyncingCohorts] = useState(false)
  const [isSyncingGrids, setIsSyncingGrids] = useState(false)
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

  const handleSyncCohorts = () =>
    runSync({
      setLoading: setIsSyncingCohorts,
      action: syncCohorts,
      successDescription: "Cohorts synced successfully.",
      errorContext: "cohorts",
    })

  const handleSyncGrids = () =>
    runSync({
      setLoading: setIsSyncingGrids,
      action: syncGrids,
      successDescription: "Grids synced successfully.",
      errorContext: "grids",
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
    isSyncingGrids,
    isSyncingData,
    handleSyncCohorts,
    handleSyncGrids,
    handleSyncData,
  }
}

export function SyncToolbar({
  isSyncingCohorts,
  isSyncingGrids,
  isSyncingData,
  handleSyncCohorts,
  handleSyncGrids,
  handleSyncData,
}: SyncState) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSyncCohorts}
        disabled={isSyncingCohorts}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingCohorts ? 'animate-spin' : ''}`} />
        {isSyncingCohorts ? 'Syncing...' : 'Sync Cohorts'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSyncGrids}
        disabled={isSyncingGrids}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingGrids ? 'animate-spin' : ''}`} />
        {isSyncingGrids ? 'Syncing...' : 'Sync Grids'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSyncData}
        disabled={isSyncingData}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingData ? 'animate-spin' : ''}`} />
        {isSyncingData ? 'Syncing...' : 'Sync Data'}
      </Button>
    </>
  )
}
