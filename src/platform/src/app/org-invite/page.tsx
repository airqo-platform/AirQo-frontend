'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { AqCheckCircle, AqXCircle } from '@airqo/icons-react';
import { userService } from '@/shared/services/userService';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

type ApprovalStatus = 'processing' | 'success' | 'error';

interface InviteErrorDetails {
  title: string;
  message: string;
  requestId?: string;
}

interface InviteErrorPayload {
  message?: string;
  errors?:
    | {
        message?: string;
        current_status?: string;
        request_id?: string;
      }
    | Array<{
        message?: string;
      }>;
}

const extractInviteErrorDetails = (error: unknown): InviteErrorDetails => {
  const fallbackMessage =
    'Failed to process your invitation. Please try again or contact support.';
  const parsedMessage = getUserFriendlyErrorMessage(error);

  const responseData = (
    error as {
      response?: {
        data?: InviteErrorPayload;
      };
    }
  )?.response?.data;

  const payloadError =
    responseData?.errors && !Array.isArray(responseData.errors)
      ? responseData.errors
      : undefined;

  const status = payloadError?.current_status;
  const messageFromPayload =
    payloadError?.message || responseData?.message || parsedMessage;

  const inferredStatus = (() => {
    const lowerMessage = (messageFromPayload || '').toLowerCase();
    if (lowerMessage.includes('approved')) return 'approved';
    if (lowerMessage.includes('accepted')) return 'accepted';
    if (lowerMessage.includes('rejected')) return 'rejected';
    if (lowerMessage.includes('expired')) return 'expired';
    if (lowerMessage.includes('pending')) return 'pending';
    return undefined;
  })();

  const normalizedStatus = (status || inferredStatus)?.toLowerCase();
  const titleMap: Record<string, string> = {
    accepted: 'Invitation Already Accepted',
    approved: 'Invitation Already Accepted',
    rejected: 'Invitation Already Rejected',
    expired: 'Invitation Expired',
    pending: 'Invitation Is Still Pending',
  };

  return {
    title: titleMap[normalizedStatus || ''] || 'Unable to Accept Invitation',
    message: messageFromPayload || fallbackMessage,
    requestId: payloadError?.request_id,
  };
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const OrgInvitePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<ApprovalStatus>('processing');
  const [errorTitle, setErrorTitle] = useState('Unable to Accept Invitation');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const processedInviteKeyRef = useRef<string | null>(null);
  const isComponentActiveRef = useRef(false);

  const handleGoToLogin = useCallback(() => {
    setIsNavigatingToLogin(true);
    router.push('/user/login');
  }, [router]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    processedInviteKeyRef.current = null;
    window.location.reload();
  }, []);

  useEffect(() => {
    isComponentActiveRef.current = true;

    const token = searchParams.get('token');
    const targetId = searchParams.get('target_id');

    if (!token || !targetId) {
      setStatus('error');
      setErrorTitle('Invalid Invitation Link');
      setErrorMessage('Invalid invitation link. Missing token or request ID.');
      setErrorRequestId(null);

      return () => {
        isComponentActiveRef.current = false;
      };
    }

    const inviteKey = `${token}:${targetId}`;
    if (processedInviteKeyRef.current === inviteKey) {
      return () => {
        isComponentActiveRef.current = false;
      };
    }
    processedInviteKeyRef.current = inviteKey;
    setStatus('processing');
    setErrorRequestId(null);

    const approveInvitation = async () => {
      try {
        await userService.acceptEmailInvitation({
          token,
          target_id: targetId,
        });
        if (!isComponentActiveRef.current) return;

        setStatus('success');
      } catch (error) {
        if (!isComponentActiveRef.current) return;

        setStatus('error');
        const details = extractInviteErrorDetails(error);
        setErrorTitle(details.title);
        setErrorMessage(details.message);
        setErrorRequestId(details.requestId || null);
      }
    };

    approveInvitation();

    return () => {
      isComponentActiveRef.current = false;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {/* Processing State */}
            {status === 'processing' && (
              <motion.div
                key="processing"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center justify-center py-8 space-y-6"
              >
                <div className="relative">
                  <LoadingSpinner />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Processing Your Invitation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we confirm your organization membership...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <motion.div
                key="success"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center justify-center py-8 space-y-6"
              >
                {/* Animated Check Mark */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full"
                    initial={{ scale: 1, opacity: 0.75 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.75, 0, 0.75],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative bg-green-100 dark:bg-green-900/40 rounded-full p-4"
                  >
                    <AqCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center space-y-3"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Welcome Aboard!
                  </h2>
                  <p className="text-base text-muted-foreground max-w-sm">
                    You&apos;ve successfully accepted the organization
                    invitation. You can now log in to access your new workspace.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-full mt-4"
                >
                  <Button
                    onClick={handleGoToLogin}
                    variant="filled"
                    className="w-full"
                    disabled={isNavigatingToLogin}
                  >
                    {isNavigatingToLogin
                      ? 'Redirecting...'
                      : 'Continue to Login'}
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div
                key="error"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center justify-center py-8 space-y-6"
              >
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-red-100 dark:bg-red-900/40 rounded-full p-4"
                >
                  <AqXCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center space-y-3"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {errorTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {errorMessage ||
                      'An unexpected error occurred. Please try again.'}
                  </p>
                  {errorRequestId && (
                    <p className="text-xs text-muted-foreground/80 max-w-sm">
                      Reference ID: {errorRequestId}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 w-full mt-4"
                >
                  <Button
                    onClick={handleGoToLogin}
                    variant="outlined"
                    className="flex-1"
                    disabled={isNavigatingToLogin}
                  >
                    {isNavigatingToLogin ? 'Redirecting...' : 'Go to Login'}
                  </Button>
                  <Button
                    onClick={handleRetry}
                    variant="filled"
                    className="flex-1"
                    disabled={isRetrying}
                  >
                    {isRetrying ? 'Reloading...' : 'Try Again'}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgInvitePage;
