import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { userService } from '../services/userService';
import type {
  UpdateUserDetailsRequest,
  UpdatePasswordRequest,
  CreateOrganizationRequest,
} from '../types/api';
import { useSelector } from 'react-redux';
import {
  selectUser,
  selectGroups,
  selectActiveGroup,
  selectUserLoading,
  selectLoggingOut,
  selectUserError,
} from '../store/selectors';

// Update user details
export const useUpdateUserDetails = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'user/update',
    async (
      key,
      { arg }: { arg: { userId: string; details: UpdateUserDetailsRequest } }
    ) => {
      return await userService.updateUserDetails(arg.userId, arg.details);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('user/'));
      },
    }
  );
};

// Update password
export const useUpdatePassword = () => {
  return useSWRMutation(
    'user/update-password',
    async (
      key,
      { arg }: { arg: { userId: string; passwordData: UpdatePasswordRequest } }
    ) => {
      return await userService.updatePassword(arg.userId, arg.passwordData);
    }
  );
};

// Create organization request
export const useCreateOrganizationRequest = () => {
  return useSWRMutation(
    'user/create-org-request',
    async (key, { arg }: { arg: CreateOrganizationRequest }) => {
      return await userService.createOrganizationRequest(arg);
    }
  );
};

// Check slug availability
export const useCheckSlugAvailability = () => {
  return useSWRMutation(
    'user/check-slug-availability',
    async (key, { arg }: { arg: { slug: string } }) => {
      return await userService.checkSlugAvailability(arg.slug);
    }
  );
};

// Initiate account deletion
export const useInitiateAccountDeletion = () => {
  return useSWRMutation(
    'user/initiate-account-deletion',
    async (key, { arg }: { arg: { email: string } }) => {
      return await userService.initiateAccountDeletion(arg.email);
    }
  );
};

// Confirm account deletion
export const useConfirmAccountDeletion = () => {
  return useSWRMutation(
    'user/confirm-account-deletion',
    async (key, { arg }: { arg: { token: string } }) => {
      return await userService.confirmAccountDeletion(arg.token);
    }
  );
};

// Get user data
export const useUser = () => {
  const user = useSelector(selectUser);
  const groups = useSelector(selectGroups);
  const activeGroup = useSelector(selectActiveGroup);
  const isLoading = useSelector(selectUserLoading);
  const isLoggingOut = useSelector(selectLoggingOut);
  const error = useSelector(selectUserError);

  return {
    user,
    groups,
    activeGroup,
    isLoading,
    isLoggingOut,
    error,
  };
};
