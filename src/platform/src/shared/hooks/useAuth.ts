import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { usePostHog } from 'posthog-js/react';
import { hashId } from '../utils/analytics';
import { trackAuthEvent } from '../utils/enhancedAnalytics';
import { trackEvent } from '../utils/analytics';
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

// User Roles by ID fetcher
const userRolesByIdFetcher = async (
  userId: string
): Promise<UserRolesResponse> => {
  return await userService.getUserRolesById(userId);
};

// Login mutation
export const useLogin = () => {
  const posthog = usePostHog();
  return useSWRMutation(
    'auth/login',
    async (key, { arg }: { arg: LoginRequest }) => {
      return await authService.login(arg);
    },
    {
      onSuccess: data => {
        trackAuthEvent(posthog, 'login', {
          has_token: Boolean(data?.token),
          user_id: data?._id,
          organization: data?.long_organization,
        });
        trackEvent('auth_login', {
          has_token: Boolean(data?.token),
          user_id: data?._id,
          organization: data?.long_organization,
        });
      },
    }
  );
};

// Register mutation
// Register mutation
export const useRegister = () => {
  const posthog = usePostHog();
  return useSWRMutation(
    'auth/register',
    async (key, { arg }: { arg: RegisterRequest }) => {
      const response = await authService.register(arg);
      const userEmailHash = hashId(arg.email.trim().toLowerCase());

      trackAuthEvent(posthog, 'register', {
        category: arg.category,
        user_email_hash: userEmailHash,
      });
      trackEvent('auth_register', {
        category: arg.category,
        user_email_hash: userEmailHash,
      });

      return response;
    }
  );
};

// Forgot password mutation
// Forgot password mutation
export const useForgotPassword = () => {
  const posthog = usePostHog();
  return useSWRMutation(
    'auth/forgot-password',
    async (key, { arg }: { arg: ForgotPasswordRequest }) => {
      return await authService.forgotPassword(arg);
    },
    {
      onSuccess: data => {
        trackAuthEvent(posthog, 'password_reset_requested', {
          message: data?.message,
        });
        trackEvent('auth_password_reset_requested', {
          message: data?.message,
        });
      },
    }
  );
};

// Reset password mutation
// Reset password mutation
export const useResetPassword = () => {
  const posthog = usePostHog();
  return useSWRMutation(
    'auth/reset-password',
    async (key, { arg }: { arg: ResetPasswordRequest }) => {
      return await authService.resetPassword(arg);
    },
    {
      onSuccess: data => {
        trackAuthEvent(posthog, 'password_reset_completed', {
          message: data?.message,
        });
        trackEvent('auth_password_reset_completed', {
          message: data?.message,
        });
      },
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

// User roles by ID hook
export const useUserRolesById = (userId: string | null) => {
  return useSWR<UserRolesResponse>(
    userId ? `user/roles/${userId}` : null,
    userId ? () => userRolesByIdFetcher(userId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );
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
