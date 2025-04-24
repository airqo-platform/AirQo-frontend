"use client"

import { ChevronLeft, Edit, Info } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useDeviceDetails, useDeviceUpdate } from "@/core/hooks/useDevices"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Device } from "@/app/types/devices"
import { DeviceDetailsModal } from "@/components/devices/device-details-form"
import { DeviceEditModal } from "@/components/devices/edit-device-details-form"

export type EditData = {
  long_name: string
  device_number: number | undefined
  category: string
  description?: string
  phoneNumber?: string
  latitude?: string | number
  longitude?: string | number
  visibility: boolean
  isPrimaryInLocation: boolean
  generation_version?: string
  generation_count?: string | number
  [key: string]: string | number | boolean | undefined
}

const DeviceKeyDetails = ({ device }: { device: Device }) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center">
        <h3 className="font-semibold w-48">Device Number (Channel ID):</h3>
        <p>{device.device_number}</p>
      </div>
      <div className="flex items-center">
        <h3 className="font-semibold w-48">Visibility Status:</h3>
        <p>{device.visibility ? "Public" : "Private"}</p>
      </div>
      <div className="flex items-center">
        <h3 className="font-semibold w-48">Deployment Status:</h3>
        <p className="capitalize">{device.status}</p>
      </div>
    </div>
  )
}

const SaveTypeModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: {
  isOpen: boolean
  onClose: (open: boolean) => void
  onSave: (isSoftUpdate: boolean) => void
  isSaving: boolean
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Update Method</DialogTitle>
          <DialogDescription>How would you like to save your changes?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
          <Button onClick={() => onSave(true)} variant="outline" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Local Sync
          </Button>
          <Button onClick={() => onSave(false)} variant="default" autoFocus disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Global Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DeviceDetailsPage() {
  const params = useParams()
  const deviceId = params.id as string
  const { data: response, isLoading, error } = useDeviceDetails(deviceId)
  const device = response?.data
  const { updateDevice } = useDeviceUpdate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSetSaveType, setSaveType] = useState(false)
  const [editData, setEditData] = useState<EditData>({
    long_name: "",
    device_number: undefined,
    category: "",
    visibility: false,
    isPrimaryInLocation: false,
  })
  const [submitEditFormData, setSubmiteEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (device) {
      setEditData({
        long_name: device.long_name || "",
        device_number: device.device_number || undefined,
        category: device.category || "",
        description: device.description || "",
        phoneNumber: device.phoneNumber || "",
        latitude: device.latitude || "",
        longitude: device.longitude || "",
        visibility: device.visibility || false,
        isPrimaryInLocation: device.isPrimaryInLocation || false,
        generation_version: device.generation_version || "",
        generation_count: device.generation_count || "",
      })
    }
  }, [device])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Device not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const openEditModal = () => {
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
  }

  const openDetailsModal = () => {
    setIsDetailsModalOpen(true)
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getChangedFields = (original: Device, edited: EditData): Partial<EditData> => {
    const result: Partial<EditData> = {}
  
    for (const key in edited) {
      const newValue = edited[key]
      const originalValue = original[key as keyof Device]
  
      const isValueEmpty =
        newValue === "" ||
        newValue === undefined ||
        (typeof newValue === "string" && newValue.trim() === "")
  
      if (!isValueEmpty && newValue !== originalValue) {
        result[key] = newValue
      }
    }
  
    return result
  }
  

  const handleSaveChanges = () => {
    if (!editData.long_name || !editData.device_number || !editData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    const formattedData = getChangedFields(device, editData)

    setSubmiteEditFormData(formattedData)
    setSaveType(true)
  }

  const handleSave = async (isSoftUpdate: boolean) => {
    setIsSaving(true)
    try {
      await updateDevice({deviceId, updateData: submitEditFormData, isSoftUpdate})
      toast.success("Device details updated successfully")
      closeEditModal()
      setSaveType(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to update device details")
      } else {
        toast.error("Failed to update device details")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/devices/overview">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Devices
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Device Details &gt; {device.long_name}</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Logs</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="border rounded-lg p-6 mt-6">
            <DeviceKeyDetails device={device} />

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={openDetailsModal} className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                View more details
              </Button>
              <Button variant="outline" onClick={openEditModal} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Device Details
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add maintenance logs table */}
            <p>Maintenance logs will go here</p>
          </TabsContent>

          <TabsContent value="photos" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add photos grid */}
            <p>Photos will go here</p>
          </TabsContent>
        </Tabs>
      </div>

      <DeviceDetailsModal
        device={device}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={openEditModal}
      />

      <DeviceEditModal
        device={device}
        editData={editData}
        handleInputChange={handleInputChange}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveChanges}
        isSaving={isSaving}
      />

      <SaveTypeModal isOpen={isSetSaveType} onClose={setSaveType} onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
