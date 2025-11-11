// Authentication hooks
export {
  useLogin,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useUserDetails,
  useUserRoles,
  useUserRolesById,
  useMutateUserData,
} from './useAuth';

// User management hooks
export {
  useUpdateUserDetails,
  useUpdatePassword,
  useCreateOrganizationRequest,
  useCheckSlugAvailability,
  useInitiateAccountDeletion,
  useConfirmAccountDeletion,
  useUser,
} from './useUser';
export { useUserActions } from './useUserActions';

// User preferences hooks
export {
  useUpdatePreferences,
  useUpdatePreferencesWithToken,
  useUserPreferencesList,
  useUpdateUserPreferences,
  useUpdateUserTheme,
  useGroupTheme,
  useUserTheme,
} from './usePreferences';

// Checklist hooks
export { useUserChecklist, useUpdateUserChecklist } from './useChecklist';

// Device/sites hooks
export {
  useSitesSummary,
  useSitesSummaryWithToken,
  useCohortSites,
  useCohortDevices,
  useGroupCohorts,
  useActiveGroupCohorts,
  useActiveGroupCohortSites,
  useActiveGroupCohortDevices,
} from './useDevice';

// Sites data hooks
export { useSitesData } from './useSitesData';

// Device data hooks
export { useDevicesData } from './useDevicesData';

// Client management hooks
export {
  useClients,
  useClientsByUserId,
  useCreateClient,
  useUpdateClient,
  useActivateClient,
  useRequestClientActivation,
  useGenerateToken,
} from './useClient';

// Analytics hooks
export { useGetChartData, useGetRecentReadings } from './useAnalytics';

// Admin hooks
export {
  useOrganizationRequests,
  useApproveOrganizationRequest,
  useRejectOrganizationRequest,
} from './useAdmin';

// Groups hooks
export {
  useGroupJoinRequests,
  useGroupDetails,
  useSendGroupInvite,
} from './useGroups';

// Utility hooks
export { useAppDispatch, useAppSelector } from './redux';
export { useLogout } from './useLogout';
export { useResizeObserver } from './useResizeObserver';
