import type { DeviceAdapter } from "./contracts/devices";
import type { SiteAdapter } from "./contracts/sites";
import type { CohortAdapter } from "./contracts/cohorts";
import type { ManufacturerAdapter } from "./contracts/manufacturers";
import type { UserAdapter } from "./contracts/users";
import type { OrganizationAdapter } from "./contracts/organizations";
import type { AccessControlAdapter } from "./contracts/access-control";

export * from "./contracts";

/**
 * The Vertex adapter contract.
 *
 * An adapter is the single integration point between the UI and a data
 * source. It is composed of capability interfaces (devices, sites,
 * cohorts, manufacturers, users, organizations, access control) defined
 * in ./contracts — hand-written, with no dependency on any transport
 * layer. v1 ships one implementation: the mock adapter.
 *
 * The aliased members below are the preferred call names used by hooks
 * and components; they point at the underlying capability methods.
 */
export interface VertexAdapter
  extends DeviceAdapter,
    SiteAdapter,
    CohortAdapter,
    ManufacturerAdapter,
    UserAdapter,
    OrganizationAdapter,
    AccessControlAdapter {
  getDevices: DeviceAdapter["getDevicesSummaryApi"];
  getDevicesByStatus: DeviceAdapter["getDevicesByStatusApi"];
  getDeviceCount: DeviceAdapter["getDeviceCountApi"];
  getDevice: DeviceAdapter["getDeviceDetails"];
  updateDevice: DeviceAdapter["updateDeviceLocal"];
  getSites: SiteAdapter["getSitesSummary"];
  getSite: SiteAdapter["getSiteDetails"];
  getSitesByStatus: SiteAdapter["getSitesByStatusApi"];
  getNetworks: ManufacturerAdapter["getManufacturers"];
  getCurrentUser: UserAdapter["getUserDetails"];
  login: UserAdapter["loginWithDetails"];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DeviceDeployInput {
  deviceName: string;
  height: string;
  mountType: string;
  powerType: string;
  isPrimaryInLocation: boolean;
  latitude: string;
  longitude: string;
  site_name?: string;
  site_id?: string;
  network: string;
  user_id: string;
  deployment_date: string | undefined;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
}

export interface DeviceRecallInput {
  recallType: string;
  user_id: string;
  date: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
}

export interface CreateDeviceInput {
  long_name: string;
  category: string;
  description?: string;
  network: string;
  tags?: string[];
}

export interface CreateSiteInput {
  name: string;
  latitude: string;
  longitude: string;
  network: string;
}
