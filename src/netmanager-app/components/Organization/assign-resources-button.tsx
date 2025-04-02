"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResourceAssignmentModal } from "./resource-assignment-modal"
import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { useAppSelector } from "@/core/redux/hooks"
import { Globe, Laptop, Loader2 } from "lucide-react"
import type { Site } from "@/app/types/sites"

interface AssignResourcesButtonProps {
  organizationId: string
  organizationName: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  useModal?: boolean
  onSuccess?: () => void
  resourceType?: "sites" | "devices" | "both"
  children?: ReactNode
}

export function AssignResourcesButton({
  organizationId,
  organizationName,
  variant = "default",
  size = "default",
  useModal = true,
  onSuccess,
  resourceType = "both",
  children,
}: AssignResourcesButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const activeNetwork = useAppSelector((state) => state.user.activeNetwork)
  const networkId = activeNetwork?.net_name || ""

  // Fetch all available sites
  const { data: sitesData, isLoading: isLoadingSites } = useQuery({
    queryKey: ["all-sites", networkId],
    queryFn: async () => {
      const response = await sites.getSitesApi(networkId)
      return response.sites || []
    },
    enabled: !!networkId && isModalOpen && (resourceType === "sites" || resourceType === "both"),
  })

  // Fetch all available devices
  const { data: devicesData, isLoading: isLoadingDevices } = useQuery({
    queryKey: ["all-devices", networkId],
    queryFn: async () => {
      const response = await devices.getDevicesApi(networkId)
      return response.devices || []
    },
    enabled: !!networkId && isModalOpen && (resourceType === "devices" || resourceType === "both"),
  })

  // Fetch sites already assigned to this organization
  const { data: assignedSitesData, isLoading: isLoadingAssignedSites } = useQuery({
    queryKey: ["sites-summary", networkId, organizationName],
    queryFn: async () => {
      const response = await sites.getSitesSummary(networkId, organizationName)
      return response.sites || []
    },
    enabled: !!networkId && !!organizationName && isModalOpen && (resourceType === "sites" || resourceType === "both"),
  })

  // Fetch devices already assigned to this organization
  const { data: assignedDevicesData, isLoading: isLoadingAssignedDevices } = useQuery({
    queryKey: ["devices-summary", networkId, organizationName],
    queryFn: async () => {
      const response = await devices.getDevicesSummaryApi(networkId, organizationName)
      return response.devices || []
    },
    enabled:
      !!networkId && !!organizationName && isModalOpen && (resourceType === "devices" || resourceType === "both"),
  })

  // Prepare site data with assignment status - handle the case where assignedSitesData is not an array
  const availableSites =
    sitesData?.map((site: Site) => {
      // Check if assignedSitesData is an array before using .some()
      const isAssigned = Array.isArray(assignedSitesData)
        ? assignedSitesData.some((assignedSite: { id: string }) => assignedSite.id === site._id)
        : false

      return {
        id: site._id,
        name: site.name,
        assigned: isAssigned,
      }
    }) || []

  // Prepare device data with assignment status - handle the case where assignedDevicesData is not an array
  const availableDevices =
    devicesData?.map((device) => {
      // Check if assignedDevicesData is an array before using .some()
      const isAssigned = Array.isArray(assignedDevicesData)
        ? assignedDevicesData.some((assignedDevice) => assignedDevice._id === device._id)
        : false

      return {
        id: device._id,
        name: device.name,
        assigned: isAssigned,
      }
    }) || []

  // Track overall loading state
  const isDataLoading = isLoadingSites || isLoadingDevices || isLoadingAssignedSites || isLoadingAssignedDevices

  const handleClick = () => {
    setIsLoading(true)
    if (useModal) {
      setIsModalOpen(true)
      setIsLoading(false)
    } else {
      router.push(`/organizations/${organizationId}/assign-resources`)
    }
  }

  // Determine button text and icon based on resource type
  let buttonText = "Assign Resources"
  let buttonIcon = null

  if (!children) {
    if (resourceType === "sites") {
      buttonText = "Assign Sites"
      buttonIcon = <Globe className="mr-2 h-4 w-4" />
    } else if (resourceType === "devices") {
      buttonText = "Assign Devices"
      buttonIcon = <Laptop className="mr-2 h-4 w-4" />
    }
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children || (
            <>
              {buttonIcon}
              {buttonText}
            </>
          )
        )}
      </Button>

      {useModal && (
        <ResourceAssignmentModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          organizationId={organizationId}
          organizationName={organizationName}
          availableSites={availableSites}
          availableDevices={availableDevices}
          networkId={networkId}
          onSuccess={() => {
            onSuccess?.()
            setIsModalOpen(false)
          }}
          initialTab={resourceType === "sites" ? "sites" : resourceType === "devices" ? "devices" : undefined}
          isLoading={isDataLoading}
        />
      )}
    </>
  )
}

