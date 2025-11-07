'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, LoadingSpinner, ErrorBanner } from '@/shared/components/ui';
import { useConfirmAccountDeletion, useLogout } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { AqCheckCircle, AqXCircle } from '@airqo/icons-react';

const ConfirmDeletePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { trigger: confirmDeletion } = useConfirmAccountDeletion();
  const logout = useLogout('/user/login?message=Account deleted successfully');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState<string>('');

  // Refs to prevent memory leaks and multiple executions
  const hasExecutedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to clear timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup; // Cleanup on unmount
  }, [cleanup]);

  useEffect(() => {
    // Prevent multiple executions
    if (!params.token || hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    const handleConfirmation = async () => {
      try {
        const token = Array.isArray(params.token)
          ? params.token[0]
          : params.token;

        const response = await confirmDeletion({ token });

        if (response.success) {
          setStatus('success');
          setMessage(
            response.message || 'Your account has been successfully deleted.'
          );

          // Set account deletion flag for other tabs/browsers immediately
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('account_deleted', 'true');
              localStorage.setItem(
                'account_deleted_timestamp',
                Date.now().toString()
              );
            } catch (error) {
              console.warn('Error setting account deletion flag:', error);
            }
          }

          // Show success message for 1.5 seconds before logging out
          setTimeout(async () => {
            await logout();
          }, 1500);
        } else {
          // Handle API success but logical failure (success: false)
          setStatus('error');
          setMessage(
            response.message || 'Failed to delete account. Please try again.'
          );

          // Redirect to profile after 3 seconds
          timeoutRef.current = setTimeout(() => {
            router.push('/user/profile');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        const errorMessage = getUserFriendlyErrorMessage(error);
        setMessage(errorMessage);

        // Redirect to profile after 3 seconds
        timeoutRef.current = setTimeout(() => {
          router.push('/user/profile');
        }, 3000);
      }
    };

    handleConfirmation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoToProfile = useCallback(() => {
    cleanup(); // Clear any pending timeouts
    router.push('/user/profile');
  }, [cleanup, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            {status === 'loading' && (
              <div className="space-y-4">
                <LoadingSpinner className="mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Confirming Account Deletion
                  </h2>
                  <p className="text-sm text-gray-600">
                    Please wait while we process your request...
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <AqCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Account Deleted Successfully
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{message}</p>
                  <p className="text-xs text-gray-500">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <AqXCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Account Deletion Failed
                  </h2>
                  <ErrorBanner
                    title=""
                    message={message}
                    className="text-left"
                  />
                  <div className="mt-6">
                    <Button onClick={handleGoToProfile} className="w-full">
                      Return to Profile
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">
                      You will be redirected automatically in a few seconds...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePage;
