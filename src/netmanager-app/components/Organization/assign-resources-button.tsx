"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResourceAssignmentModal } from "./resource-assignment-modal"
import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { useAppSelector } from "@/core/redux/hooks"
import { Site } from "@/app/types/sites"

interface AssignResourcesButtonProps {
  organizationId: string
  organizationName: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  useModal?: boolean
  onSuccess?: () => void
}

export function AssignResourcesButton({
  organizationId,
  organizationName,
  variant = "default",
  size = "default",
  useModal = true,
  onSuccess,
}: AssignResourcesButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeNetwork = useAppSelector((state) => state.user.activeNetwork)
  const networkId = activeNetwork?.net_name || ""

  // Fetch all available sites
  const { data: sitesData } = useQuery({
    queryKey: ["all-sites", networkId],
    queryFn: async () => {
      const response = await sites.getSitesSummary(networkId, organizationName)
      return response.sites || []
    },
    enabled: !!networkId && isModalOpen,
  })

  // Fetch all available devices
  const { data: devicesData, } = useQuery({
    queryKey: ["all-devices", networkId],
    queryFn: async () => {
      const response = await devices.getDevicesSummaryApi(networkId, organizationName)
      return response.devices || []
    },
    enabled: !!networkId && isModalOpen,
  })

  // Fetch sites already assigned to this organization
  const { data: assignedSitesData } = useQuery({
    queryKey: ["sites-summary", networkId, organizationName],
    queryFn: async () => {
      const response = await sites.getSitesSummary(networkId, organizationName)
      return response.sites || []
    },
    enabled: !!networkId && !!organizationName && isModalOpen,
  })

  // Fetch devices already assigned to this organization
  const { data: assignedDevicesData } = useQuery({
    queryKey: ["devices-summary", networkId, organizationName],
    queryFn: async () => {
      const response = await devices.getDevicesSummaryApi(networkId, organizationName)
      return response.devices || []
    },
    enabled: !!networkId && !!organizationName && isModalOpen,
  })

  // Prepare site data with assignment status
  const availableSites =
    sitesData?.map((site: Site) => {
    const isAssigned: boolean = assignedSitesData?.some((assignedSite: { _id: string }) => assignedSite._id === site._id) || false
      return {
        id: site._id,
        name: site.name,
        assigned: isAssigned,
      }
    }) || []

  // Prepare device data with assignment status
  const availableDevices =
    devicesData?.map((device) => {
      const isAssigned = assignedDevicesData?.some((assignedDevice) => assignedDevice._id === device._id)
      return {
        id: device._id,
        name: device.name,
        assigned: isAssigned,
      }
    }) || []

  const handleClick = () => {
    if (useModal) {
      setIsModalOpen(true)
    } else {
      router.push(`/organizations/${organizationId}/assign-resources`)
    }
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick}>
        Assign Resources
      </Button>

      {useModal && (
        <ResourceAssignmentModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          organizationId={organizationId}
          organizationName={organizationName}
          networkId={networkId}
          availableSites={availableSites}
          availableDevices={availableDevices}
          onSuccess={() => {
            onSuccess?.()
            setIsModalOpen(false)
          }}
        />
      )}
    </>
  )
}

