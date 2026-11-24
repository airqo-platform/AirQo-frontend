"use client"

/**
 * Hooks for integration-specific UI on shared screens. Empty in the template: add your own
 * top-bar buttons, device page tabs or sign-in hand-off here.
 */
import type { ComponentType, ReactNode } from "react"

/** Wraps the app, e.g. to complete a sign-in handed back from an identity provider. */
export function AuthHandoff({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>
}

/** Extra buttons in the top bar, before the account menu. */
export function TopNavExtras() {
  return null
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

/** Tabs added after the shared ones on a device page. */
export const DEVICE_EXTENSION_TABS: DeviceExtensionTab[] = []
