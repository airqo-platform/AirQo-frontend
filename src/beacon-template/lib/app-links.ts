import { beaconConfig } from "@/beacon.config"

/**
 * Links to companion apps, from `links` in beacon.config.ts. An empty URL means the app isn't
 * there, and the prompts that point to it are hidden.
 *
 * - deviceManagementUrl: where devices are added, claimed and deployed.
 * - organisationAccessUrl: where people request access to an organisation.
 */
const join = (base: string, path: string) => (base ? `${base.replace(/\/$/, "")}${path}` : "")

const deviceManagement = beaconConfig.links.deviceManagementUrl || ""
const organisationAccess = beaconConfig.links.organisationAccessUrl || ""

export const APP_LINKS = {
  deviceManagement,
  /** Personal devices in the device management app. */
  deviceManagementMyDevices: join(deviceManagement, "/devices/my-devices"),
  /** The active organisation's devices in the device management app. */
  deviceManagementOrgDevices: join(deviceManagement, "/devices/overview"),
  organisationAccess,
  organisationAccessRequest: join(organisationAccess, "/request-organization"),
} as const
