import { beaconConfig } from "@/beacon.config"
import type { EnvironmentUrl } from "@/lib/beacon-config"
import { config } from "@/lib/config"

/**
 * Links to companion apps, from `links` in beacon.config.ts: where devices are added
 * (`deviceManagement`) and where people ask to join an organisation (`organisationAccess`).
 * Production opens the production apps; staging and local development open staging.
 *
 * NODE_ENV can't tell staging from production because `next build` always sets it to production,
 * so this goes by `config.environment`, which reads the address the app is running on.
 * An empty URL means the app isn't there, and the prompts that point to it are hidden.
 */
export function resolveEnvironmentUrl(url: EnvironmentUrl | undefined, environment: string): string {
  if (!url) return ""
  if (typeof url === "string") return url
  return (environment === "production" ? url.production : url.staging) || ""
}

const join = (base: string, path: string) => (base ? `${base.replace(/\/$/, "")}${path}` : "")

/** Lowercase app name for analytics (`destination`), or a generic key when the app has no name. */
const analyticsKey = (name: string, fallback: string) => name.trim().toLowerCase().replace(/\s+/g, "_") || fallback

export function getAppLinks(environment: string) {
  const { deviceManagement, organisationAccess } = beaconConfig.links
  const devices = resolveEnvironmentUrl(deviceManagement.url, environment)
  const access = resolveEnvironmentUrl(organisationAccess.url, environment)

  return {
    deviceManagement: devices,
    deviceManagementName: deviceManagement.name,
    deviceManagementKey: analyticsKey(deviceManagement.name, "device_management"),
    /** Personal devices: claiming and importing devices happen here. */
    deviceManagementMyDevices: join(devices, "/devices/my-devices"),
    /** The active organisation's devices. */
    deviceManagementOrgDevices: join(devices, "/devices/overview"),
    organisationAccess: access,
    organisationAccessName: organisationAccess.name,
    organisationAccessKey: analyticsKey(organisationAccess.name, "organisation_access"),
    /** Organisation access is requested from a selector in this app's top bar. */
    organisationAccessRequest: join(access, "/request-organization"),
  } as const
}

export const APP_LINKS = getAppLinks(config.environment)

/** "Add a device in {app name}", or "Add a device" when the app has no name. */
export const inApp = (text: string, name: string) => (name ? `${text} in ${name}` : text)
