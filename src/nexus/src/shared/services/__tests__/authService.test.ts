jest.mock('../apiClient', () => {
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  return {
    createOpenClient: () => ({
      post: mockPost,
      put: mockPut,
    }),
    __mockPost: mockPost,
    __mockPut: mockPut,
  };
});

const { __mockPost: mockPost, __mockPut: mockPut } = jest.requireMock(
  '../apiClient'
) as {
  __mockPost: jest.Mock;
  __mockPut: jest.Mock;
};

const AuthService = jest.requireActual('../authService').authService;

const _v = () => 'x';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('calls post with correct endpoint and credentials', async () => {
      mockPost.mockResolvedValueOnce({
        data: { _id: '1', token: 'mock-token-abc', email: 'test@test.com' },
        status: 200,
      });
      const credentials = {
        userName: 'test@test.com',
        password: _v(),
      };

      await AuthService.login(credentials);

      expect(mockPost).toHaveBeenCalledWith('/users/login', credentials);
    });

    it('returns data on success (no success field)', async () => {
      const responseData = {
        _id: '1',
        token: 'test-token-abc',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      };
      mockPost.mockResolvedValueOnce({ data: responseData, status: 200 });

      const result = await AuthService.login({
        userName: 'test@test.com',
        password: _v(),
      });

      expect(result).toEqual(responseData);
    });

    it('returns data when success is true', async () => {
      const responseData = {
        success: true,
        _id: '1',
        token: 'test-token-abc',
        email: 'test@test.com',
      };
      mockPost.mockResolvedValueOnce({ data: responseData, status: 200 });

      const result = await AuthService.login({
        userName: 'test@test.com',
        password: _v(),
      });

      expect(result).toEqual(responseData);
    });

    it('throws EnhancedError when success is false', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: false, message: 'Invalid credentials' },
        status: 401,
      });

      await expect(
        AuthService.login({
          userName: 'test@test.com',
          password: _v(),
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws EnhancedError with status, data, success properties', async () => {
      const errorResponse = {
        success: false,
        message: 'Invalid credentials',
        errors: null,
      };
      mockPost.mockResolvedValueOnce({
        data: errorResponse,
        status: 401,
      });

      try {
        await AuthService.login({
          userName: 'test@test.com',
          password: _v(),
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid credentials');
        expect((error as { status: number }).status).toBe(401);
        expect((error as { data: unknown }).data).toEqual(errorResponse);
        expect((error as { success: boolean }).success).toBe(false);
      }
    });

    it('throws EnhancedError on network error with status 500 and success false', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));

      try {
        await AuthService.login({
          userName: 'test@test.com',
          password: _v(),
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network Error');
        expect((error as { status: number }).status).toBe(500);
        expect((error as { success: boolean }).success).toBe(false);
      }
    });

    it('uses fallback message Login failed when message missing', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: false },
        status: 400,
      });

      await expect(
        AuthService.login({
          userName: 'test@test.com',
          password: _v(),
        })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('calls post with correct endpoint', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: true, message: 'ok', user: {} },
      });
      const userData = {
        email: 'new@test.com',
        password: _v(),
        firstName: 'Test',
        lastName: 'User',
        category: 'individual' as const,
      };

      await AuthService.register(userData);

      expect(mockPost).toHaveBeenCalledWith('/users', userData);
    });

    it('returns data on success', async () => {
      const responseData = {
        success: true,
        message: 'Registered',
        user: { firstName: 'Test', lastName: 'User', email: 'new@test.com' },
      };
      mockPost.mockResolvedValueOnce({ data: responseData });

      const result = await AuthService.register({
        email: 'new@test.com',
        password: _v(),
        firstName: 'Test',
        lastName: 'User',
        category: 'individual' as const,
      });

      expect(result).toEqual(responseData);
    });

    it('throws error when success is false', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: false, message: 'User exists' },
      });

      await expect(
        AuthService.register({
          email: 'test@test.com',
          password: _v(),
          firstName: 'Test',
          lastName: 'User',
          category: 'individual' as const,
        })
      ).rejects.toThrow('User exists');
    });
  });

  describe('forgotPassword', () => {
    it('calls post with correct endpoint', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: true, message: 'Email sent' },
      });

      await AuthService.forgotPassword({ email: 'test@test.com' });

      expect(mockPost).toHaveBeenCalledWith('/users/forgotPassword', {
        email: 'test@test.com',
      });
    });

    it('returns data on success', async () => {
      const responseData = { success: true, message: 'Email sent' };
      mockPost.mockResolvedValueOnce({ data: responseData });

      const result = await AuthService.forgotPassword({
        email: 'test@test.com',
      });

      expect(result).toEqual(responseData);
    });

    it('throws error when success is false', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: false, message: 'User not found' },
      });

      await expect(
        AuthService.forgotPassword({ email: 'unknown@test.com' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('calls put with correct endpoint', async () => {
      mockPut.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset' },
      });
      const payload = {
        password: _v(),
        resetPasswordToken: _v(),
      };

      await AuthService.resetPassword(payload);

      expect(mockPut).toHaveBeenCalledWith(
        '/users/updatePasswordViaEmail',
        payload
      );
    });

    it('returns data on success', async () => {
      const responseData = {
        success: true,
        message: 'Password reset',
        user: {},
      };
      mockPut.mockResolvedValueOnce({ data: responseData });

      const result = await AuthService.resetPassword({
        password: _v(),
        resetPasswordToken: _v(),
      });

      expect(result).toEqual(responseData);
    });

    it('throws error when success is false', async () => {
      mockPut.mockResolvedValueOnce({
        data: { success: false, message: 'Token expired' },
      });

      await expect(
        AuthService.resetPassword({
          password: _v(),
          resetPasswordToken: _v(),
        })
      ).rejects.toThrow('Token expired');
    });
  });
});
