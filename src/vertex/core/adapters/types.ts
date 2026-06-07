import { devices } from "../apis/devices";
import { sites } from "../apis/sites";
import { cohorts } from "../apis/cohorts";
import { networks } from "../apis/networks";
import { users } from "../apis/users";
import { grids } from "../apis/grids";
import { groupsApi } from "../apis/organizations";
import { permissions } from "../apis/permissions";
import { roles } from "../apis/roles";
import { feedbackService } from "../apis/feedback";

type BaseApis = typeof devices &
  typeof sites &
  typeof cohorts &
  typeof networks &
  typeof users &
  typeof grids &
  typeof groupsApi &
  typeof permissions &
  typeof roles &
  typeof feedbackService;

export interface VertexAdapter extends BaseApis {
  // We keep the generic overrides we defined previously so that
  // components using adapter.getDevices (instead of adapter.getDevicesSummaryApi) still work
  getDevices: typeof devices.getDevicesSummaryApi;
  getDevicesByStatus: typeof devices.getDevicesByStatusApi;
  getDeviceCount: typeof devices.getDeviceCountApi;
  getDevice: typeof devices.getDeviceDetails;
  updateDevice: typeof devices.updateDeviceLocal;
  getSites: typeof sites.getSitesSummary;
  getSite: typeof sites.getSiteDetails;
  getSitesByStatus: typeof sites.getSitesByStatusApi;
  getNetworks: typeof networks.getNetworksApi;
  getCurrentUser: typeof users.getUserDetails;
  login: typeof users.loginWithDetails;
}
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Reading {
  _id: string;
  device_id: string;
  device_name: string;
  site_id?: string;
  time: string;
  pm2_5: number;
  pm10: number;
  latitude?: number;
  longitude?: number;
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
