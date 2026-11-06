import { config } from "@/lib/config"

/**
 * Links to the other AirQo apps, where devices are added (Vertex) and organisation access is
 * requested (Nexus). Production opens the production apps; staging and local development open staging.
 *
 * NODE_ENV can't tell staging from production because `next build` always sets it to production,
 * so this goes by `config.environment`, which reads the address Beacon is running on.
 */
export function getAppLinks(environment: string) {
  const urlFor = (app: string) => `https://${environment === "production" ? "" : "staging-"}${app}.airqo.net`
  const vertex = urlFor("vertex")
  const nexus = urlFor("nexus")

  return {
    vertex,
    /** Personal devices: "Claim AirQo Device" and "Import Device" live here. */
    vertexMyDevices: `${vertex}/devices/my-devices`,
    /** The active organisation's devices. */
    vertexOrgDevices: `${vertex}/devices/overview`,
    /** Organisation access is requested from the selector in Nexus's top bar. */
    nexus,
    nexusRequestOrganisation: `${nexus}/request-organization`,
  } as const
}

export const APP_LINKS = getAppLinks(config.environment)
