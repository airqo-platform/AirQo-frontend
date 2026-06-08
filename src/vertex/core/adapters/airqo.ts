import { VertexAdapter } from "./types";
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

export const airqoAdapter: VertexAdapter = {
  // Spread all core API implementations
  ...devices,
  ...sites,
  ...cohorts,
  ...networks,
  ...users,
  ...grids,
  ...groupsApi,
  ...permissions,
  ...roles,

  // Feedback class methods (they don't spread)
  submitFeedback: feedbackService.submitFeedback.bind(feedbackService),
  submitSatisfactionFeedback: feedbackService.submitSatisfactionFeedback.bind(feedbackService),
  submitLoginFeedback: feedbackService.submitLoginFeedback.bind(feedbackService),

  // Generic overrides
  getDevices: devices.getDevicesSummaryApi,
  getDevicesByStatus: devices.getDevicesByStatusApi,
  getDeviceCount: devices.getDeviceCountApi,
  getDevice: devices.getDeviceDetails,
  updateDevice: devices.updateDeviceLocal,
  getSites: sites.getSitesSummary,
  getSite: sites.getSiteDetails,
  getSitesByStatus: sites.getSitesByStatusApi,
  getNetworks: networks.getNetworksApi,
  getCurrentUser: users.getUserDetails,
  login: users.loginWithDetails,
};
