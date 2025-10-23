// API Types for authentication and user services

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  _id: string;
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  privilege: string;
  organization: string;
  long_organization: string;
  profilePicture: string;
  country: string;
  phoneNumber: string | null;
  interests: string[];
  interestsDescription: string | null;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rateLimit: unknown;
  lastLogin: string;
  expiresAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  category: 'individual' | 'organisation';
}

export interface RegisterResponse {
  success: true;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    verified: boolean;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: true;
  message: string;
}

export interface ResetPasswordRequest {
  password: string;
  resetPasswordToken: string;
}

export interface ResetPasswordResponse {
  success: true;
  message: string;
  user: Record<string, unknown>;
}

export interface UserDetailsResponse {
  success: true;
  message: string;
  users: User[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  lastLogin: string;
  timezone: string;
  isActive: boolean;
  loginCount: number;
  userName: string;
  email: string;
  verified: boolean;
  analyticsVersion: number;
  country: string;
  privilege: string | null;
  website: string;
  category: string;
  organization: string;
  long_organization: string;
  rateLimit: unknown;
  jobTitle: string;
  description: string;
  profilePicture: string;
  phoneNumber: string | null;
  interests: string | null;
  interestsDescription: string | null;
  updatedAt: string;
  groups: Group[];
  createdAt: string;
  my_networks: unknown[];
  my_groups: MyGroup[];
}

export interface Network {
  net_name: string;
  _id: string;
  role: Role;
  userType: string;
}

export interface Role {
  _id: string;
  role_name: string;
  role_permissions: RolePermission[];
}

export interface RolePermission {
  _id: string;
  permission: string;
}

export interface Client {
  _id: string;
  isActive: boolean;
  ip_addresses: string[];
  name: string;
  client_secret: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    loginCount: number;
    preferredTokenStrategy?: string;
    phoneNumber?: number;
    theme?: {
      primaryColor: string;
      mode: string;
      interfaceStyle: string;
      contentLayout: string;
    };
  };
  access_token?: {
    _id: string;
    permissions: string[];
    scopes: string[];
    expiredEmailSent: boolean;
    token: string;
    client_id: string;
    name: string;
    expires: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface Group {
  grp_title: string;
  organization_slug: string;
  grp_profile_picture: string;
  _id: string;
  createdAt: string;
  status: string;
  role: Role;
  userType: string;
}

export interface Permission {
  _id: string;
  permission: string;
}

export interface MyGroup {
  _id: string;
  grp_title: string;
  grp_profile_picture: string;
  grp_country: string;
  grp_image: string;
  grp_industry: string;
  grp_timezone: string;
  grp_website: string;
  organization_slug: string;
  theme: {
    primaryColor: string;
    mode: string;
    interfaceStyle: string;
    contentLayout: string;
  };
}

export interface UserRolesResponse {
  success: true;
  message: string;
  user_roles: {
    user_id: string;
    groups: Array<{
      group_id: string;
      group_name: string;
      role_id: string;
      role_name: string;
      permissions: string[];
    }>;
    networks: Array<{
      network_id: string;
      network_name: string;
      role_id: string;
      role_name: string;
      permissions: string[];
    }>;
  };
}

// Error response types
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: Array<{
    param: string;
    message: string;
    location: string;
  }> | null;
}

// Union type for all responses
export type ApiResponse<T> = T | ApiErrorResponse;

// User preferences update
export interface UpdatePreferencesRequest {
  user_id: string;
  [key: string]: unknown;
}

export interface UpdatePreferencesResponse {
  success: boolean;
  message: string;
}

// Update user details
export interface UpdateUserDetailsRequest {
  [key: string]: unknown;
}

export interface UpdateUserDetailsResponse {
  success: boolean;
  message: string;
}

// Update password
export interface UpdatePasswordRequest {
  password: string;
  old_password: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

// Devices sites summary
export interface SitesSummaryMeta {
  total: number;
  totalResults: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  detailLevel: string;
  usedCache: boolean;
  nextPage?: string;
  previousPage?: string;
}

export interface SitesSummaryResponse {
  success: boolean;
  message: string;
  meta: SitesSummaryMeta;
  sites: Record<string, unknown>[];
}

export interface SitesSummaryParams {
  skip?: number;
  limit?: number;
  tenant?: string;
  detailLevel?: string;
  search?: string;
}

// Cohort-based API types
export interface CohortSitesRequest {
  cohort_ids: string[];
}

export interface CohortSitesParams {
  search?: string;
  skip?: number;
  limit?: number;
  category?: string;
}

export interface CohortSitesMeta {
  total: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  nextPage?: string;
}

export interface CohortSitesResponse {
  success: boolean;
  message: string;
  meta: CohortSitesMeta;
  sites: Record<string, unknown>[];
}

export interface CohortDevicesRequest {
  cohort_ids: string[];
}

export interface CohortDevicesParams {
  search?: string;
  skip?: number;
  limit?: number;
  category?: string;
  status?: string;
}

export interface CohortDevicesMeta {
  total: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
}

export interface CohortDevicesResponse {
  success: boolean;
  message: string;
  meta: CohortDevicesMeta;
  devices: Record<string, unknown>[];
}

export interface GroupCohortsResponse {
  success: boolean;
  message: string;
  data: string[];
}

// Grids summary types
export interface GridSite {
  _id: string;
  name: string;
  formatted_name: string;
  approximate_latitude: number;
  approximate_longitude: number;
  country: string;
  region: string;
  district: string;
  county: string;
  sub_county?: string;
  parish?: string;
  city: string;
  search_name: string;
  location_name: string;
}

export interface Grid {
  _id: string;
  groups: string[];
  visibility: boolean;
  name: string;
  admin_level: string;
  network: string;
  long_name: string;
  createdAt: string;
  sites: GridSite[];
  numberOfSites: number;
}

export interface GridsSummaryMeta {
  total: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  nextPage?: string;
}

export interface GridsSummaryResponse {
  success: boolean;
  message: string;
  meta: GridsSummaryMeta;
  grids: Grid[];
}

export interface GridsSummaryParams {
  skip?: number;
  admin_level?: string;
  limit?: number;
  search?: string;
}

// Email verification
export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

// User Checklist Types
export interface ChecklistItem {
  _id: string;
  title: string;
  completed: boolean;
  status: 'not started' | 'in progress' | 'completed' | 'started';
  videoProgress: number;
  completionDate: string | null;
}

export interface UserChecklist {
  _id: string;
  user_id: string;
  items: ChecklistItem[];
}

export interface GetUserChecklistResponse {
  success: boolean;
  message: string;
  checklists: UserChecklist[];
}

export interface UpdateChecklistItem {
  _id?: string; // Optional for new items, required for updates
  title?: string;
  completed?: boolean;
  completionDate?: string | null;
  videoProgress?: number;
  status?: 'not started' | 'in progress' | 'completed' | 'started';
}

export interface UpdateUserChecklistRequest {
  user_id: string;
  items: UpdateChecklistItem[];
}

export interface UpdateUserChecklistResponse {
  success: boolean;
  message: string;
  checklist: UserChecklist;
}

// Client management types
export interface Client {
  _id: string;
  isActive: boolean;
  ip_addresses: string[];
  name: string;
  client_secret: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    loginCount: number;
    preferredTokenStrategy?: string;
    phoneNumber?: number;
    theme?: {
      primaryColor: string;
      mode: string;
      interfaceStyle: string;
      contentLayout: string;
    };
  };
  access_token?: {
    _id: string;
    permissions: string[];
    scopes: string[];
    expiredEmailSent: boolean;
    token: string;
    client_id: string;
    name: string;
    expires: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface GetClientsResponse {
  success: boolean;
  message: string;
  clients: Client[];
}

export interface CreateClientRequest {
  name: string;
  user_id?: string;
  ip_addresses?: string[];
}

export interface CreateClientResponse {
  success: boolean;
  message: string;
  client: Client;
}

export interface UpdateClientRequest {
  name?: string;
  ip_addresses?: string[];
}

export interface UpdateClientResponse {
  success: boolean;
  message: string;
  client: Client;
}

export interface ActivateClientRequest {
  isActive: boolean;
}

export interface ActivateClientResponse {
  success: boolean;
  message: string;
  client: Client;
}

export interface RequestClientActivationResponse {
  success: boolean;
  message: string;
}

export interface GenerateTokenRequest {
  name: string;
  client_id: string;
}

export interface GenerateTokenResponse {
  success: boolean;
  message: string;
  token: {
    _id: string;
    permissions: string[];
    scopes: string[];
    expiredEmailSent: boolean;
    token: string;
    client_id: string;
    name: string;
    expires: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

// Preferences types
export interface Site {
  isFeatured?: boolean;
  _id: string;
  formatted_name?: string;
  search_name: string;
  parish?: string;
  sub_county?: string;
  city?: string;
  district?: string;
  county?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  approximate_latitude?: number;
  approximate_longitude?: number;
  generated_name?: string;
  createdAt?: string;
}

export interface Theme {
  primaryColor: string;
  mode: 'light' | 'dark';
  interfaceStyle: 'default' | 'bordered';
  contentLayout: 'compact' | 'wide';
}

export interface Period {
  label: string;
}

export interface UserPreference {
  _id: string;
  pollutant: string;
  frequency: string;
  startDate: string;
  endDate: string;
  chartType: string;
  chartTitle: string;
  chartSubTitle: string;
  airqloud_id: string;
  grid_id: string;
  network_id: string;
  group_id: string;
  site_ids: string[];
  device_ids: string[];
  user_id: string;
  period: Period;
  selected_sites: Site[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastAccessed: string;
  theme: Theme;
}

export interface GetUserPreferencesResponse {
  success: boolean;
  message: string;
  preference: UserPreference;
}

export interface UpdateUserPreferencesRequest {
  user_id: string;
  group_id: string;
  selected_sites: Site[];
}

export interface UpdateUserPreferencesResponse {
  success: boolean;
  message: string;
}

export interface GetUserPreferencesListResponse {
  success: boolean;
  message: string;
  preferences: UserPreference[];
}

export interface UpdateUserThemeRequest {
  theme: Theme;
}

export interface UpdateUserThemeResponse {
  success: boolean;
  message: string;
}

export interface GetGroupThemeResponse {
  success: boolean;
  message: string;
  data: Theme;
}

export interface GetUserThemeResponse {
  success: boolean;
  message: string;
  data: Theme;
}

// Analytics types
export interface AnalyticsChartRequest {
  sites: string[];
  startDate: string;
  endDate: string;
  chartType: string;
  frequency: string;
  pollutant: string;
  organisation_name: string;
}

export interface ChartDataPoint {
  site_id: string;
  value: number;
  time: string;
  generated_name: string;
  device_id: string;
  name: string;
}

export interface AnalyticsChartResponse {
  status: string;
  message: string;
  data: ChartDataPoint[];
}

// Data download types
export interface DataDownloadRequest {
  datatype: 'calibrated' | 'raw';
  downloadType: 'csv' | 'json';
  endDateTime: string;
  frequency: 'daily';
  minimum: boolean;
  outputFormat: 'airqo-standard';
  pollutants: string[];
  startDateTime: string;
  sites?: string[];
  device_ids?: string[];
  device_names?: string[];
  metaDataFields?: string[];
  weatherFields?: string[];
  device_category?: 'lowcost' | 'bam' | 'mobile' | 'gas';
}

export interface DataDownloadItem {
  site_name: string;
  pm10?: number;
  pm2_5_calibrated_value?: number;
  pm10_calibrated_value?: number;
  latitude?: number;
  pm2_5?: number;
  longitude?: number;
  temperature?: number;
  humidity?: number;
  datetime: string;
  network: string;
  device_name: string;
  frequency: string;
}

export interface DataDownloadResponse {
  status: string;
  message: string;
  data: DataDownloadItem[];
}

// Recent readings types
export interface RecentReadingRequest {
  site_id: string; // comma-separated site IDs
}

export interface AQIRanges {
  good: { min: number; max: number };
  moderate: { min: number; max: number };
  u4sg: { min: number; max: number };
  unhealthy: { min: number; max: number };
  very_unhealthy: { min: number; max: number };
  hazardous: { min: number; max: number | null };
}

export interface Averages {
  dailyAverage: number;
  percentageDifference: number;
  weeklyAverages: {
    currentWeek: number;
    previousWeek: number;
  };
}

export interface HealthTip {
  title: string;
  description: string;
  image: string;
  tag_line: string;
}

export interface PollutantValue {
  value: number | null;
}

export interface SiteDetails {
  _id: string;
  formatted_name: string;
  street: string;
  parish: string;
  village: string;
  sub_county: string;
  town: string;
  city: string;
  district: string;
  county: string;
  region: string;
  country: string;
  name: string;
  description: string;
  location_name: string;
  search_name: string;
  approximate_latitude: number;
  approximate_longitude: number;
  data_provider: string;
  site_category: {
    tags: string[];
    category: string;
  };
}

export interface RecentReading {
  _id: string;
  site_id: string;
  time: string;
  __v: number;
  aqi_category: string;
  aqi_color: string;
  aqi_color_name: string;
  aqi_ranges: AQIRanges;
  averages: Averages;
  createdAt: string;
  device: string;
  device_id: string;
  frequency: string;
  health_tips: HealthTip[];
  is_reading_primary: boolean;
  no2: PollutantValue;
  pm10: PollutantValue;
  pm2_5: PollutantValue;
  siteDetails: SiteDetails;
  timeDifferenceHours: number;
  updatedAt: string;
}

export interface RecentReadingsResponse {
  success: boolean;
  message: string;
  measurements: RecentReading[];
}

// Organization Request Types
export interface BrandingSettings {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
}

export interface CreateOrganizationRequest {
  organization_name: string;
  organization_slug: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  use_case: string;
  organization_type: string;
  country: string;
  branding_settings: BrandingSettings;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message: string;
  data?: {
    organization_id: string;
    organization_slug: string;
    status: string;
  };
}

export interface SlugAvailabilityResponse {
  success: boolean;
  message: string;
  available: boolean;
}
