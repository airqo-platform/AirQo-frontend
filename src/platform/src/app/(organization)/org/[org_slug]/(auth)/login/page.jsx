'use client';

import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/common/components/Button';
import { signIn, getSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import AuthLayout from '@/common/components/Organization/AuthLayout';
import InputField from '@/common/components/InputField';
import ErrorBoundary from '@/common/components/ErrorBoundary';
import NotificationService from '@/core/utils/notificationService';
import logger from '@/lib/logger';
import { formatOrgSlug } from '@/core/utils/strings';
import { setupUserSession } from '@/core/utils/loginSetup';
import { useOrganizationSafe } from '@/app/providers/UnifiedGroupProvider';

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const OrganizationLogin = () => {
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { getDisplayName, primaryColor } = useOrganizationSafe();
  const orgSlug = params.org_slug;

  logger.debug('OrganizationLogin rendered', {
    orgSlug,
    isLoading,
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      logger.info('🔵 Organization Login: Form submitted', { orgSlug });
      setIsLoading(true);

      // Validate form data
      try {
        await loginSchema.validate(
          { userName, password },
          { abortEarly: false },
        );
        logger.debug('✅ Form validation passed');
      } catch (validationError) {
        logger.warn('❌ Form validation failed', { errors: validationError.inner });
        const messages = validationError.inner
          .map((err) => err.message)
          .join(', ');
        setIsLoading(false);
        NotificationService.error(422, messages);
        return;
      }

      try {
        logger.info('🌐 Calling signIn with credentials', { userName, orgSlug });
        const result = await signIn('credentials', {
          userName: userName,
          password,
          orgSlug,
          redirect: false,
        });

        logger.debug('📡 signIn result:', {
          ok: result?.ok,
          error: result?.error,
          status: result?.status,
        });

        if (result?.error) {
          logger.error('❌ Sign in failed:', result.error);
          let statusCode = 401;
          let customMessage = null;

          const errorMsg = result.error.toLowerCase();

          if (
            errorMsg.includes('invalid credentials') ||
            errorMsg.includes('authentication failed') ||
            errorMsg.includes('incorrect password') ||
            errorMsg.includes('unauthorized')
          ) {
            statusCode = 401;
            customMessage =
              'Invalid email or password. Please check your credentials and try again.';
          } else if (
            errorMsg.includes('user not found') ||
            errorMsg.includes('account does not exist')
          ) {
            statusCode = 404;
            customMessage = 'No account found with this email address.';
          } else if (
            errorMsg.includes('account locked') ||
            errorMsg.includes('account disabled') ||
            errorMsg.includes('account suspended')
          ) {
            statusCode = 403;
            customMessage =
              'Your account has been suspended. Please contact support.';
          } else if (
            errorMsg.includes('too many attempts') ||
            errorMsg.includes('rate limit') ||
            errorMsg.includes('throttled')
          ) {
            statusCode = 429;
            customMessage =
              'Too many login attempts. Please wait a moment and try again.';
          } else if (
            errorMsg.includes('network error') ||
            errorMsg.includes('fetch') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('timeout')
          ) {
            statusCode = 503;
            customMessage =
              'Connection problem. Please check your internet and try again.';
          } else if (
            errorMsg.includes('server error') ||
            errorMsg.includes('internal error')
          ) {
            statusCode = 500;
            customMessage =
              'Server error occurred. Please try again in a moment.';
          } else {
            statusCode = 400;
            customMessage = result.error;
          }

          NotificationService.error(statusCode, customMessage);
          return;
        }

        if (result?.ok) {
          logger.info('✅ Sign in successful, fetching session');
          NotificationService.success(200, 'Welcome back!');

          try {
            logger.info('📋 Getting session...');
            const session = await getSession();
            logger.debug('✅ Session retrieved:', {
              userId: session?.user?.id,
              hasRequestedOrgSlug: !!session?.requestedOrgSlug,
              requestedOrgSlug: session?.requestedOrgSlug,
              orgSlug: session?.orgSlug,
            });

            if (session?.user) {
              logger.info('✅ User found in session, computing redirect path');
              const redirectOrg =
                session.requestedOrgSlug || session.orgSlug || orgSlug;
              const setupPath = redirectOrg
                ? `/org/${redirectOrg}`
                : '/user/Home';

              logger.info('🔄 Calling setupUserSession', {
                setupPath,
                redirectOrg,
                userId: session.user.id,
              });

              try {
                logger.info('⏳ setupUserSession starting...');
                const setupResult = await setupUserSession(session, dispatch, setupPath, {
                  maintainActiveGroup: true,
                });
                logger.debug('setupUserSession result:', {
                  success: setupResult?.success,
                  error: setupResult?.error,
                  activeGroupId: setupResult?.activeGroup?._id,
                });

                if (!setupResult?.success) {
                  logger.error('❌ setupUserSession failed:', setupResult?.error);
                  NotificationService.error(
                    500,
                    setupResult?.error || 'Login setup failed',
                  );
                  return;
                }

                logger.info('✅ setupUserSession completed successfully');

                const dest = redirectOrg
                  ? `/org/${redirectOrg}/dashboard`
                  : '/user/Home';

                logger.info('🚀 Redirecting to:', dest);
                if (redirectOrg) {
                  router.replace(dest);
                } else {
                  router.replace('/user/Home');
                }
                return;
              } catch (setupErr) {
                logger.error('❌ setupUserSession error:', {
                  message: setupErr?.message,
                  name: setupErr?.name,
                  stack: setupErr?.stack,
                });
                NotificationService.error(
                  500,
                  setupErr.message || 'Login setup failed',
                );
                return;
              }
            }

            logger.error('❌ No user found in session');
            NotificationService.error(
              500,
              'Session setup failed. Please try logging in again.',
            );
            return;
          } catch (err) {
            logger.error('❌ Session retrieval error:', {
              message: err?.message,
              name: err?.name,
            });
            NotificationService.error(
              500,
              err.message || 'Failed to retrieve session',
            );
            return;
          }
        } else {
          logger.error('❌ signIn returned not ok:', result?.status);
          NotificationService.error(500, 'Login failed. Please try again.');
        }
      } catch (err) {
        logger.error('❌ Organization login unexpected error:', {
          message: err?.message,
          name: err?.name,
          stack: err?.stack,
        });
        NotificationService.error(
          500,
          err.message || 'Something went wrong, please try again',
        );
      } finally {
        logger.info('🏁 Login attempt completed');
        setIsLoading(false);
      }
    },
    [userName, password, orgSlug, router, dispatch],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <ErrorBoundary
      name="OrganizationLogin"
      feature="Organization Authentication"
    >
      <AuthLayout
        title={`Sign in to ${formatOrgSlug(getDisplayName())}`}
        subtitle="Access your organization's air quality analytics dashboard"
      >
        <div className="w-full">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mt-6">
              <InputField
                label="Email Address"
                type="email"
                placeholder="e.g. user@organization.com"
                value={userName}
                onChange={setUserName}
                required
                primaryColor={primaryColor}
                disabled={isLoading}
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="******"
                  value={password}
                  onChange={setPassword}
                  primaryColor={primaryColor}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-10">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="w-full text-sm transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                style={{
                  backgroundColor: isLoading ? '#d1d5db' : primaryColor,
                  color: isLoading ? '#222' : undefined,
                  boxShadow: isLoading
                    ? 'none'
                    : `0 4px 14px 0 ${primaryColor}25`,
                }}
                aria-busy={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
      </AuthLayout>
    </ErrorBoundary>
  );
};

export default OrganizationLogin;