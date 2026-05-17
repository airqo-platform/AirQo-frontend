'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { openFeedbackDialog } from './feedback-dialog';
import { feedbackService } from '@/core/apis/feedback';
import { useUserContext } from '@/core/hooks/useUserContext';
import { toast } from '@/components/shared/toast/ReusableToast';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import { usePathname } from 'next/navigation';

const NEGATIVE_REASONS = [
  'Confusing',
  'Not helpful',
  'Missing features',
  'Missing or limited data',
  'I encountered technical issues',
  'Other',
];

const POSITIVE_REASONS = [
  'Informative',
  'Actionable',
  'Makes my job easier',
  'Ease of use',
  'Other',
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, reason: string, message: string) => Promise<boolean>;
  isSubmitting: boolean;
  type: 'positive' | 'negative';
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  type,
}) => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const reasons = type === 'positive' ? POSITIVE_REASONS : NEGATIVE_REASONS;

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    const submitted = await onSubmit(
      type === 'positive' ? 5 : 1,
      reason,
      message
    );
    if (!submitted) return;
    setReason('');
    setMessage('');
    onClose();
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={() => {
        setReason('');
        setMessage('');
        onClose();
      }}
      title="Why did you choose this rating?"
      size="md"
      showFooter
      primaryAction={{
        label: isSubmitting ? 'Sending...' : 'Submit',
        onClick: handleSubmit,
        disabled: isSubmitting || !reason,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => {
          setReason('');
          setMessage('');
          onClose();
        },
        disabled: isSubmitting,
        variant: 'outline',
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Select a reason
          </label>
          <div className="space-y-2">
            {reasons.map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="h-4 w-4 text-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </div>

        <ReusableInputField
          as="textarea"
          id="message"
          label="Any additional feedback about this page you would like to share with us?"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Your feedback helps us improve..."
          rows={5}
          description="Please don't include any sensitive information"
        />
      </div>
    </ReusableDialog>
  );
};

export const PageSatisfactionBanner: React.FC = () => {
  const [modalType, setModalType] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  const { userDetails } = useUserContext();

  const getPageName = () => {
    if (!pathname) return 'this page';
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || 'home';
    return lastPart
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSubmitFeedback = async (
    rating: number,
    reason: string,
    message: string
  ): Promise<boolean> => {
    const userEmail = userDetails?.email || userDetails?.userName || '';

    if (!userEmail) {
      toast.error('Unable to identify your account. Please try again in a moment.');
      return false;
    }

    setIsSubmitting(true);

    try {
      const metadata = {
        page: pathname || window.location.pathname,
        reason,
        browser:
          typeof window !== 'undefined'
            ? navigator.userAgent.slice(0, 80)
            : 'Unknown',
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      };

      await feedbackService.submitFeedback({
        email: userEmail,
        subject: `Page Satisfaction: ${getPageName()}`,
        message: message || `Rating: ${rating}/5, Reason: ${reason}`,
        rating,
        category: 'other',
        platform: 'web',
        app: 'vertex',
        metadata,
      });

      toast.success('Thank you for your feedback!');
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? getApiErrorMessage(error)
          : 'An error occurred while submitting feedback'
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-6 px-0 mt-8">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Overall, how satisfied are you with {getPageName()}?
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <ReusableButton
              variant="text"
              onClick={() => setModalType('positive')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Satisfied"
            >
              <ThumbsUp className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </ReusableButton>

            <ReusableButton
              variant="text"
              onClick={() => setModalType('negative')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Not satisfied"
            >
              <ThumbsDown className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </ReusableButton>

            <ReusableButton
              variant="text"
              onClick={openFeedbackDialog}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Comment"
            >
              <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </ReusableButton>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modalType === 'positive'}
        onClose={() => setModalType(null)}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmitting}
        type="positive"
      />

      <FeedbackModal
        isOpen={modalType === 'negative'}
        onClose={() => setModalType(null)}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmitting}
        type="negative"
      />
    </>
  );
};
