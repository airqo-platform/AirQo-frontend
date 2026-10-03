'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { AqXClose } from '@airqo/icons-react';
import { openFeedbackDialog } from './feedback-dialog';
import { feedbackService } from '@/core/apis/feedback';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useBanner } from '@/context/banner-context';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import { usePathname } from 'next/navigation';
import { usePageTitleContext } from '@/context/page-title-context';
import Card from '@/components/shared/card/CardWrapper';
import {
  isPageSatisfactionSuppressed,
  suppressPageSatisfaction,
  suppressPageSatisfactionForSession,
} from '@/core/utils/userPreferences';
import { useFeedbackPromptSlot } from './feedback-prompt-slot';

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

/** Time spent on a page before the banner asks anything. */
const DWELL_BEFORE_ASKING_MS = 30 * 1000;
/** A click or keypress this far into the visit also counts as settling in. */
const INTERACTION_MIN_DWELL_MS = 5 * 1000;
/** How long the inline thank-you stays up before the banner goes away. */
const THANK_YOU_MS = 6 * 1000;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, message: string) => Promise<boolean>;
  isSubmitting: boolean;
  type: 'positive' | 'negative';
  /** The 👎 is enough on its own, so offer a way to send it with no reason. */
  allowSubmitWithoutReason?: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  type,
  allowSubmitWithoutReason = false,
}) => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const reasons = type === 'positive' ? POSITIVE_REASONS : NEGATIVE_REASONS;

  const handleClose = () => {
    setReason('');
    setMessage('');
    onClose();
  };

  const send = async (withDetail: boolean) => {
    const submitted = withDetail
      ? await onSubmit(reason, message)
      : await onSubmit('', '');
    if (!submitted) return;
    handleClose();
  };

  const hasDetail = Boolean(reason) || Boolean(message.trim());

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={
        type === 'positive'
          ? 'What worked well on this page?'
          : 'Why did you choose this rating?'
      }
      size="md"
      showFooter
      primaryAction={{
        label: isSubmitting ? 'Sending...' : 'Submit',
        onClick: () => send(true),
        disabled: isSubmitting || !hasDetail,
      }}
      secondaryAction={
        allowSubmitWithoutReason
          ? {
              label: 'Send without a reason',
              onClick: () => send(false),
              disabled: isSubmitting,
              variant: 'outline',
            }
          : {
              label: 'Cancel',
              onClick: handleClose,
              disabled: isSubmitting,
              variant: 'outline',
            }
      }
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Select a reason (optional)
          </label>
          <div className="space-y-2">
            {reasons.map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  disabled={isSubmitting}
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
          onChange={event => setMessage(event.target.value)}
          placeholder="Your feedback helps us improve..."
          rows={5}
          disabled={isSubmitting}
          description="Please don't include any sensitive information"
        />
      </div>
    </ReusableDialog>
  );
};

interface PageSatisfactionBannerProps {
  isSidebarCollapsed?: boolean;
}

type BannerVisibility = 'pending' | 'asking' | 'thanks' | 'gone';

export const PageSatisfactionBanner: React.FC<PageSatisfactionBannerProps> = ({
  isSidebarCollapsed = false,
}) => {
  const [visibility, setVisibility] = useState<BannerVisibility>('pending');
  const [modalType, setModalType] = useState<'positive' | 'negative' | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { userDetails } = useUserContext();
  const { showBanner } = useBanner();
  const { title: pageName, section: pageSection } = usePageTitleContext();
  const promptSlotHolder = useFeedbackPromptSlot();

  const page = pathname || '';

  // Ask at most once per page per cooldown, and only once the user has settled
  // in: either they have been here a while or they have actually done something.
  useEffect(() => {
    if (!page || isPageSatisfactionSuppressed(page)) {
      setVisibility('gone');
      return;
    }

    setVisibility('pending');

    const arrivedAt = Date.now();
    const reveal = () =>
      setVisibility(current => (current === 'pending' ? 'asking' : current));

    const dwellTimer = setTimeout(reveal, DWELL_BEFORE_ASKING_MS);
    const handleInteraction = () => {
      if (Date.now() - arrivedAt >= INTERACTION_MIN_DWELL_MS) reveal();
    };

    window.addEventListener('pointerdown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      clearTimeout(dwellTimer);
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [page]);

  // Asking is what counts, answered or not: a page gets one prompt per cooldown.
  // This waits for the banner to actually be on screen, so a prompt held back by
  // the login popup does not quietly use up the page's turn.
  useEffect(() => {
    if (visibility !== 'asking' || promptSlotHolder) return;
    suppressPageSatisfaction(page);
  }, [page, promptSlotHolder, visibility]);

  // The thank-you is short-lived, but it holds the "Tell us more" link, so the
  // countdown waits while the pointer is on it or its dialog is open.
  useEffect(() => {
    if (visibility !== 'thanks' || isHovered || modalType) return;

    const hideTimer = setTimeout(() => setVisibility('gone'), THANK_YOU_MS);
    return () => clearTimeout(hideTimer);
  }, [isHovered, modalType, visibility]);

  const submitRating = useCallback(
    async (
      rating: number,
      reason?: string,
      detail?: string,
      isFollowUp = false
    ): Promise<boolean> => {
      const userEmail = userDetails?.email || userDetails?.userName || '';

      if (!userEmail) {
        showBanner({
          severity: 'error',
          title: 'Unable to identify your account',
          message: 'Please try again in a moment.',
          scoped: true,
        });
        return false;
      }

      setIsSubmitting(true);

      try {
        // Nothing written means the message is a bare "Positive"/"Negative":
        // that is what keeps counted clicks out of the support inbox.
        const description =
          [reason, detail?.trim()].filter(Boolean).join(' — ') || undefined;

        await feedbackService.submitSatisfactionFeedback({
          email: userEmail,
          subject: `Page Satisfaction: ${pageName}`,
          rating,
          description,
          page: page || window.location.pathname,
          metadata: {
            pageTitle: pageName,
            pageSection,
            ...(reason ? { reason } : {}),
            // Detail added after the rating was already counted.
            ...(isFollowUp ? { isFollowUp: true } : {}),
          },
        });

        return true;
      } catch (error) {
        showBanner({
          severity: 'error',
          title: 'Failed to submit feedback',
          message:
            error instanceof Error
              ? getApiErrorMessage(error)
              : 'An error occurred while submitting feedback',
          scoped: true,
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, pageName, pageSection, showBanner, userDetails]
  );

  // A 👍 is one click: send it and say thank you.
  const handlePositive = useCallback(async () => {
    const submitted = await submitRating(5);
    if (!submitted) return;
    setVisibility('thanks');
  }, [submitRating]);

  // Dismissing sends nothing. The page is already quiet for the cooldown; a
  // dismissal also silences every other page for the rest of the session.
  const handleDismiss = useCallback(() => {
    suppressPageSatisfactionForSession();
    setVisibility('gone');
  }, []);

  const handleModalSubmit = useCallback(
    async (reason: string, message: string): Promise<boolean> => {
      if (!modalType) return false;

      // The positive dialog is only reachable from the thank-you, so the 👍 has
      // already been counted and this is extra detail.
      const isPositiveFollowUp = modalType === 'positive';
      const submitted = await submitRating(
        isPositiveFollowUp ? 5 : 1,
        reason,
        message,
        isPositiveFollowUp
      );
      if (!submitted) return false;

      setVisibility('gone');
      setTimeout(() => {
        showBanner({
          severity: 'success',
          title: 'Thank you for your feedback!',
          message: 'Your input helps us improve the platform.',
        });
      }, 300);
      return true;
    },
    [modalType, showBanner, submitRating]
  );

  // The post-login popup shares this corner of the screen; wait for it to go.
  const isOnScreen =
    (visibility === 'asking' || visibility === 'thanks') && !promptSlotHolder;

  return (
    <>
      {isOnScreen && (
        <div
          className={`fixed bottom-0 right-0 z-50 md:px-3 md:pb-3 transition-all duration-300 pointer-events-none ${
            isSidebarCollapsed ? 'lg:left-[88px]' : 'lg:left-[256px]'
          } left-0`}
        >
          <Card
            bordered
            padding="py-2 px-2"
            radius="rounded-xl"
            className="mx-auto w-fit max-w-full md:max-w-7xl pointer-events-auto"
          >
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {visibility === 'thanks' ? (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Thanks for rating this page!
                  </p>
                  <div className="flex items-center gap-1">
                    <ReusableButton
                      variant="text"
                      padding="px-2 py-1"
                      className="text-sm"
                      onClick={() => setModalType('positive')}
                    >
                      Tell us more
                    </ReusableButton>
                    <ReusableButton
                      variant="text"
                      padding="p-2"
                      onClick={() => setVisibility('gone')}
                      Icon={AqXClose}
                      iconClassName="h-4 w-4 text-gray-600 dark:text-gray-300"
                      aria-label="Dismiss"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                  <div className="text-center sm:text-right">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Overall, how satisfied are you with {pageName}?
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <ReusableButton
                      variant="text"
                      onClick={handlePositive}
                      disabled={isSubmitting}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Satisfied"
                    >
                      <ThumbsUp className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </ReusableButton>

                    <ReusableButton
                      variant="text"
                      onClick={() => setModalType('negative')}
                      disabled={isSubmitting}
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

                    <ReusableButton
                      variant="text"
                      onClick={handleDismiss}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Dismiss"
                    >
                      <AqXClose className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </ReusableButton>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <FeedbackModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        type={modalType ?? 'negative'}
        allowSubmitWithoutReason={modalType === 'negative'}
      />
    </>
  );
};
