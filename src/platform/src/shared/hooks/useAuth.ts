import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserDetailsResponse,
  UserRolesResponse,
} from '../types/api';

// User Details fetcher
const userDetailsFetcher = async (
  userId: string
): Promise<UserDetailsResponse> => {
  return await userService.getUserDetails(userId);
};

// User Roles fetcher
const userRolesFetcher = async (): Promise<UserRolesResponse> => {
  return await userService.getUserRoles();
};

// Login mutation
export const useLogin = () => {
  return useSWRMutation(
    'auth/login',
    async (key, { arg }: { arg: LoginRequest }) => {
      return await authService.login(arg);
    }
  );
};

// Register mutation
export const useRegister = () => {
  return useSWRMutation(
    'auth/register',
    async (key, { arg }: { arg: RegisterRequest }) => {
      return await authService.register(arg);
    }
  );
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useSWRMutation(
    'auth/forgot-password',
    async (key, { arg }: { arg: ForgotPasswordRequest }) => {
      return await authService.forgotPassword(arg);
    }
  );
};

// Reset password mutation
export const useResetPassword = () => {
  return useSWRMutation(
    'auth/reset-password',
    async (key, { arg }: { arg: ResetPasswordRequest }) => {
      return await authService.resetPassword(arg);
    }
  );
};

// Verify email mutation
export const useVerifyEmail = () => {
  return useSWRMutation(
    'auth/verify-email',
    async (key, { arg }: { arg: { userId: string; token: string } }) => {
      return await userService.verifyEmail(arg.userId, arg.token);
    }
  );
};

// User details hook
export const useUserDetails = (userId: string | null) => {
  return useSWR<UserDetailsResponse>(
    userId ? `user/details/${userId}` : null,
    userId ? () => userDetailsFetcher(userId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
};

// User roles hook
export const useUserRoles = () => {
  return useSWR<UserRolesResponse>('user/roles', userRolesFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
};

// Cache invalidation helper
export const useMutateUserData = () => {
  const { mutate } = useSWRConfig();

  return {
    invalidateUserData: () => {
      mutate(key => typeof key === 'string' && key.startsWith('user/'));
    },
  };
};
