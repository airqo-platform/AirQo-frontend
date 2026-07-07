import { ApiClient, createOpenClient } from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ApiErrorResponse,
} from '../types/api';

interface EnhancedError extends Error {
  status: number;
  data: ApiErrorResponse | null;
  success: boolean;
}

export class AuthService {
  private openClient: ApiClient;

  constructor() {
    this.openClient = createOpenClient();
  }

  // Login - open endpoint
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.openClient.post<
        LoginResponse | ApiErrorResponse
      >('/users/login', credentials);
      const data = response.data;

      if ('success' in data && !data.success) {
        // Create enhanced error with status and full response data
        const error: EnhancedError = new Error(
          data.message || 'Login failed'
        ) as EnhancedError;
        error.status = response.status;
        error.data = data;
        error.success = data.success;
        throw error;
      }

      return data as LoginResponse;
    } catch (error: unknown) {
      // If it's already our enhanced error, re-throw it
      if (
        error &&
        typeof error === 'object' &&
        'data' in error &&
        'status' in error
      ) {
        throw error as EnhancedError;
      }

      // For network/other errors, create enhanced error
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const enhancedError: EnhancedError = new Error(
        axiosError?.message || 'Login failed'
      ) as EnhancedError;
      enhancedError.status = axiosError?.response?.status || 500;
      enhancedError.data =
        (axiosError?.response?.data as ApiErrorResponse) || null;
      enhancedError.success = false;
      throw enhancedError;
    }
  }

  // Register - open endpoint
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.openClient.post<
      RegisterResponse | ApiErrorResponse
    >('/users', userData);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    return data as RegisterResponse;
  }

  // Forgot Password - open endpoint
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const response = await this.openClient.post<
      ForgotPasswordResponse | ApiErrorResponse
    >('/users/forgotPassword', data);
    const result = response.data;

    if ('success' in result && !result.success) {
      throw new Error(result.message || 'Forgot password failed');
    }

    return result as ForgotPasswordResponse;
  }

  // Reset Password - open endpoint
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const response = await this.openClient.put<
      ResetPasswordResponse | ApiErrorResponse
    >('/users/updatePasswordViaEmail', data);
    const result = response.data;

    if ('success' in result && !result.success) {
      throw new Error(result.message || 'Reset password failed');
    }

    return result as ResetPasswordResponse;
  }
}

// Export singleton instance
export const authService = new AuthService();
