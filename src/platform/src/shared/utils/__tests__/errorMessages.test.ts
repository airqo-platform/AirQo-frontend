import {
  getUserFriendlyErrorMessage,
  createErrorMessageGetter,
  isForbiddenError,
  DEFAULT_ERROR_MAPPINGS,
} from '../errorMessages';

describe('errorMessages', () => {
  describe('getUserFriendlyErrorMessage', () => {
    describe('null/undefined errors', () => {
      it('returns default message for null', () => {
        const result = getUserFriendlyErrorMessage(null);
        expect(result).toBe('Something went wrong. Please try again.');
      });

      it('returns default message for undefined', () => {
        const result = getUserFriendlyErrorMessage(undefined);
        expect(result).toBe('Something went wrong. Please try again.');
      });
    });

    describe('string errors', () => {
      it('returns mapped message for exact match', () => {
        const result = getUserFriendlyErrorMessage('Login failed');
        expect(result).toBe(
          'Login failed. Please check your credentials and try again.'
        );
      });

      it('returns mapped message for partial match', () => {
        const result = getUserFriendlyErrorMessage('Network connection lost');
        expect(result).toContain('Network error');
      });

      it('returns original error for no match', () => {
        const result = getUserFriendlyErrorMessage('Something custom happened');
        expect(result).toBe('Something custom happened');
      });
    });

    describe('Axios errors', () => {
      it('returns message from response.data.errors array', () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: {
              errors: [{ message: 'Email is required' }],
            },
          },
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe('Email is required');
      });

      it('returns message from response.data.errors object', () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: {
              errors: { message: 'Invalid parameters' },
            },
          },
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe('Invalid parameters');
      });

      it('returns mapped message for HTTP status code', () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 404,
            data: {},
          },
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe('The requested resource was not found.');
      });

      it('returns network error message for ERR_NETWORK', () => {
        const axiosError = {
          isAxiosError: true,
          code: 'ERR_NETWORK',
          response: undefined,
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe(
          'Network error. Please check your internet connection and try again.'
        );
      });

      it('returns status 403 mapped message', () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 403,
            data: {},
          },
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe(
          'Access denied. You do not have permission to perform this action.'
        );
      });
    });

    describe('Error objects', () => {
      it('returns mapped message for exact match', () => {
        const error = new Error('Invalid credentials');
        const result = getUserFriendlyErrorMessage(error);
        expect(result).toBe(
          'Invalid email or password. Please check your credentials and try again.'
        );
      });

      it('returns mapped message for partial match', () => {
        const error = new Error('Network timeout occurred');
        const result = getUserFriendlyErrorMessage(error);
        expect(result).toContain('Network error');
      });

      it('returns error.message for no match', () => {
        const error = new Error('Custom internal error');
        const result = getUserFriendlyErrorMessage(error);
        expect(result).toBe('Custom internal error');
      });
    });

    describe('NextAuth error objects', () => {
      it('returns mapped message for CredentialsSignin', () => {
        const error = { error: 'CredentialsSignin' };
        const result = getUserFriendlyErrorMessage(error);
        expect(result).toBe(
          'Invalid email or password. Please check your credentials and try again.'
        );
      });
    });

    describe('custom mappings', () => {
      it('returns custom mapping when provided', () => {
        const result = getUserFriendlyErrorMessage('Special error', {
          'Special error': 'Custom friendly message',
        });
        expect(result).toBe('Custom friendly message');
      });

      it('falls back to default text when Default mapping is removed', () => {
        const result = getUserFriendlyErrorMessage(null, {
          Default: undefined,
        });
        expect(result).toBe('An unexpected error occurred. Please try again.');
      });

      it('falls back to Default mapping when a partial-match mapping is empty', () => {
        const result = getUserFriendlyErrorMessage('foo bar', { foo: '' });
        expect(result).toBe('Something went wrong. Please try again.');
      });
    });

    describe('edge cases', () => {
      it('skips array error items that have no message', () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: {
              errors: [{ param: 'email' }],
            },
          },
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe(
          'Invalid request. Please check your input and try again.'
        );
      });

      it('ignores generic root messages and falls back to status mapping', () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 422,
            data: {
              message: 'request failed with axioserror',
            },
          },
        };
        const result = getUserFriendlyErrorMessage(axiosError);
        expect(result).toBe('Validation failed. Please check your input.');
      });

      it('falls back to default network message when mapping removed', () => {
        const axiosError = {
          isAxiosError: true,
          code: 'ERR_NETWORK',
          response: undefined,
        };
        const result = getUserFriendlyErrorMessage(axiosError, {
          network: undefined,
        });
        expect(result).toBe(
          'Network error. Please check your internet connection and try again.'
        );
      });

      it('returns Default mapping for unrecognised non-error objects', () => {
        const result = getUserFriendlyErrorMessage({ foo: 'bar' }, {});
        expect(result).toBe('Something went wrong. Please try again.');
      });

      it('falls back to Default mapping for Error object with empty partial-match mapping', () => {
        const error = new Error('foo bar');
        const result = getUserFriendlyErrorMessage(error, { foo: '' });
        expect(result).toBe('Something went wrong. Please try again.');
      });
    });
  });

  describe('createErrorMessageGetter', () => {
    it('returns a function', () => {
      const getter = createErrorMessageGetter({});
      expect(typeof getter).toBe('function');
    });

    it('returned function uses custom mappings', () => {
      const getter = createErrorMessageGetter({
        CustomError: 'Custom user message',
      });
      const result = getter('CustomError');
      expect(result).toBe('Custom user message');
    });

    it('returned function falls back to defaults', () => {
      const getter = createErrorMessageGetter({});
      const result = getter(null);
      expect(result).toBe('Something went wrong. Please try again.');
    });
  });

  describe('isForbiddenError', () => {
    it('returns true for Axios error with 403', () => {
      const error = {
        isAxiosError: true,
        response: { status: 403 },
      };
      expect(isForbiddenError(error)).toBe(true);
    });

    it('returns true for Error with status 403', () => {
      const error = Object.assign(new Error('Forbidden'), { status: 403 });
      expect(isForbiddenError(error)).toBe(true);
    });

    it('returns true for object with status 403', () => {
      const error = { status: 403 };
      expect(isForbiddenError(error)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isForbiddenError(null)).toBe(false);
    });

    it('returns false for non-403 Axios error', () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
      };
      expect(isForbiddenError(error)).toBe(false);
    });

    it('returns false for non-403 status object', () => {
      const error = { status: 500 };
      expect(isForbiddenError(error)).toBe(false);
    });

    it('returns false for non-numeric status property', () => {
      const error = { status: '403' };
      expect(isForbiddenError(error)).toBe(false);
    });
  });

  describe('DEFAULT_ERROR_MAPPINGS', () => {
    it('has entries for common HTTP status codes', () => {
      expect(DEFAULT_ERROR_MAPPINGS[400]).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS[401]).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS[403]).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS[404]).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS[500]).toBeDefined();
    });

    it('has entries for common error strings', () => {
      expect(DEFAULT_ERROR_MAPPINGS['Invalid credentials']).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS['network']).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS['Login failed']).toBeDefined();
    });

    it('has entries for NextAuth errors', () => {
      expect(DEFAULT_ERROR_MAPPINGS['CredentialsSignin']).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS['EmailSignin']).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS['OAuthSignin']).toBeDefined();
      expect(DEFAULT_ERROR_MAPPINGS['AccessDenied']).toBeDefined();
    });
  });
});
