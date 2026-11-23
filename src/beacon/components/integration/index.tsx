"use client"

/**
 * Beacon's AirQo-only UI, plugged into shared screens. The exported template replaces this file
 * with empty versions (template/overlay/components/integration/index.tsx), and leaves out what it
 * imports.
 */
import type { ComponentType, ReactNode } from "react"
import dynamic from "next/dynamic"
import { FileText, TerminalIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppDropdown from "@/components/dashboard/app-dropdown"
import { beaconConfig } from "@/beacon.config"
import { OAuthHandoff } from "./oauth-handoff"

/** Wraps the app: completes a social sign-in handed back by the platform. */
export function AuthHandoff({ children }: Readonly<{ children: ReactNode }>) {
  if (beaconConfig.auth.provider !== "platform") return <>{children}</>
  return <OAuthHandoff>{children}</OAuthHandoff>
}

/** Extra buttons in the top bar, before the account menu: the AirQo apps launcher. */
export function TopNavExtras() {
  return <AppDropdown />
}

export interface DeviceExtensionTabProps {
  device: {
    _id: string
    name: string
    long_name?: string
    transmissionStatus?: string
  }
}

export interface DeviceExtensionTab {
  value: string
  label: string
  icon: ComponentType<{ className?: string }>
  render: (props: DeviceExtensionTabProps) => ReactNode
}

const RemoteTerminalTab = dynamic(() => import("@/app/dashboard/devices/[id]/remote-terminal-tab"), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] w-full bg-[#1e1e1e] flex items-center justify-center text-gray-500 rounded-md border border-gray-800">
      Initializing workbench...
    </div>
  ),
})

/** Tabs added after the shared ones on a device page. */
export const DEVICE_EXTENSION_TABS: DeviceExtensionTab[] = [
  {
    value: "remote-shell",
    label: "Remote Shell",
    icon: TerminalIcon,
    render: ({ device }) => (
      <RemoteTerminalTab
        deviceId={device._id}
        deviceName={device.long_name || device.name}
        transmissionStatus={device.transmissionStatus}
      />
    ),
  },
  {
    value: "files",
    label: "Files",
    icon: FileText,
    render: () => (
      <Card>
        <CardHeader>
          <CardTitle>Device Files</CardTitle>
          <CardDescription>View and manage files associated with this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500">
            <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p>No files available for this device.</p>
          </div>
        </CardContent>
      </Card>
    ),
  },
]
