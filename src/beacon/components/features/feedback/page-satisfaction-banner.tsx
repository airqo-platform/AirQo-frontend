'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { AqXClose } from '@airqo/icons-react';

import authService from '@/services/api-service';
import { feedbackService } from '@/services/feedback.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useGroup } from '@/lib/group-context';
import { DEFAULT_PAGE_TITLE, getPageTitle } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import {
  isPageSatisfactionSuppressed,
  suppressPageSatisfaction,
  suppressPageSatisfactionForSession,
} from '@/lib/feedback-preferences';
import { openFeedbackDialog } from './feedback-dialog';
import { useFeedbackPromptSlot } from './feedback-prompt-slot';

const NEGATIVE_REASONS = [
  'Confusing',
  'Not helpful',
  'Missing features',
  'Missing or limited data',
  'Slow to load',
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
  /** Resolves to an error message, or null once the feedback is sent. */
  onSubmit: (reason: string, message: string) => Promise<string | null>;
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
  // Shown inline: toasts sit underneath the dialog overlay.
  const [error, setError] = useState<string | null>(null);

  const reasons = type === 'positive' ? POSITIVE_REASONS : NEGATIVE_REASONS;

  const handleClose = () => {
    setReason('');
    setMessage('');
    setError(null);
    onClose();
  };

  const send = async (withDetail: boolean) => {
    setError(null);
    const failure = withDetail ? await onSubmit(reason, message) : await onSubmit('', '');
    if (failure) {
      setError(failure);
      return;
    }
    handleClose();
  };

  const hasDetail = Boolean(reason) || Boolean(message.trim());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && handleClose()}>
      <DialogContent className="sm:max-w-md" showFeedbackButton={false}>
        <DialogHeader>
          <DialogTitle>
            {type === 'positive' ? 'What worked well on this page?' : 'Why did you choose this rating?'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Optional details about your rating of this page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Select a reason (optional)</p>
            <RadioGroup
              value={reason}
              onValueChange={setReason}
              disabled={isSubmitting}
              aria-label="Reason"
              className="gap-2"
            >
              {reasons.map((r, index) => (
                <div key={r} className="flex items-center gap-2">
                  <RadioGroupItem value={r} id={`page-satisfaction-reason-${index}`} />
                  <Label
                    htmlFor={`page-satisfaction-reason-${index}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="page-satisfaction-message" className="text-sm font-medium">
              Any additional feedback about this page you would like to share with us?
            </Label>
            <Textarea
              id="page-satisfaction-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Your feedback helps us improve..."
              rows={5}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Please don&apos;t include any sensitive information
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {allowSubmitWithoutReason ? (
            <Button variant="outline" onClick={() => send(false)} disabled={isSubmitting}>
              Send without a reason
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button onClick={() => send(true)} disabled={isSubmitting || !hasDetail}>
            {isSubmitting ? 'Sending...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type BannerVisibility = 'pending' | 'asking' | 'thanks' | 'gone';

interface PageSatisfactionBannerProps {
  className?: string;
}

/**
 * Asks "how satisfied are you with this page?" once someone has settled in.
 * Each kind of page (every device detail page counts as one) is asked at most
 * once per cooldown, and dismissing silences the banner for the session.
 */
export const PageSatisfactionBanner: React.FC<PageSatisfactionBannerProps> = ({
  // Sits at the bottom of the content column, above Leaflet's map controls.
  className = 'absolute inset-x-0 bottom-0 z-[1100] flex justify-center px-2 pb-2 md:px-3 md:pb-3',
}) => {
  const [visibility, setVisibility] = useState<BannerVisibility>('pending');
  const [modalType, setModalType] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { activeGroup } = useGroup();
  const promptSlotHolder = useFeedbackPromptSlot();

  const page = pathname || '';
  const pageName = getPageTitle(page);
  // Pages without a name of their own are not asked about.
  const pageKey = pageName === DEFAULT_PAGE_TITLE ? '' : pageName;

  // Ask at most once per page per cooldown, and only once the person has
  // settled in: either they have been here a while or they have done something.
  useEffect(() => {
    if (!pageKey || isPageSatisfactionSuppressed(pageKey)) {
      setVisibility('gone');
      return;
    }

    setVisibility('pending');

    const arrivedAt = Date.now();
    const reveal = () => setVisibility(current => (current === 'pending' ? 'asking' : current));

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
  }, [pageKey]);

  // Asking is what counts, answered or not: a page gets one prompt per cooldown.
  // This waits for the banner to actually be on screen, so a prompt held back by
  // the login popup does not quietly use up the page's turn.
  useEffect(() => {
    if (visibility !== 'asking' || promptSlotHolder) return;
    suppressPageSatisfaction(pageKey);
  }, [pageKey, promptSlotHolder, visibility]);

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
    ): Promise<string | null> => {
      const storedUser = authService.getUserData();
      const userEmail = session?.user?.email || storedUser?.email || storedUser?.userName || '';

      if (!userEmail) {
        return 'Unable to identify your account. Please try again in a moment.';
      }

      setIsSubmitting(true);

      try {
        const description = [reason, detail?.trim()].filter(Boolean).join(' — ') || undefined;

        await feedbackService.submitSatisfactionFeedback({
          email: userEmail,
          subject: `Page Satisfaction: ${pageName}`,
          rating,
          description,
          page: page || window.location.pathname,
          metadata: {
            pageTitle: pageName,
            ...(activeGroup ? { activeGroup } : {}),
            ...(reason ? { reason } : {}),
            // Detail added after the rating was already counted.
            ...(isFollowUp ? { isFollowUp: true } : {}),
          },
        });

        return null;
      } catch (error) {
        return error instanceof Error && error.message
          ? error.message
          : 'An error occurred while submitting feedback';
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeGroup, page, pageName, session]
  );

  // A 👍 is one click: send it and say thank you.
  const handlePositive = useCallback(async () => {
    const failure = await submitRating(5);
    if (failure) {
      toast({ variant: 'destructive', title: 'Failed to submit feedback', description: failure });
      return;
    }
    setVisibility('thanks');
  }, [submitRating]);

  // Dismissing sends nothing. The page is already quiet for the cooldown; a
  // dismissal also silences every other page for the rest of the session.
  const handleDismiss = useCallback(() => {
    suppressPageSatisfactionForSession();
    setVisibility('gone');
  }, []);

  const handleModalSubmit = useCallback(
    async (reason: string, message: string): Promise<string | null> => {
      if (!modalType) return null;

      // The positive dialog is only reachable from the thank-you, so the 👍 has
      // already been counted and this is extra detail.
      const isPositiveFollowUp = modalType === 'positive';
      const failure = await submitRating(
        isPositiveFollowUp ? 5 : 1,
        reason,
        message,
        isPositiveFollowUp
      );
      if (failure) return failure;

      setVisibility('gone');
      setTimeout(() => {
        toast({
          title: 'Thank you for your feedback!',
          description: 'Your input helps us improve Beacon.',
        });
      }, 300);
      return null;
    },
    [modalType, submitRating]
  );

  // The post-login popup gets the screen first; wait for it to go.
  const isOnScreen = (visibility === 'asking' || visibility === 'thanks') && !promptSlotHolder;

  return (
    <>
      {isOnScreen && (
        <div className={cn('pointer-events-none', className)}>
          <Card
            className="pointer-events-auto w-fit max-w-full rounded-xl px-2 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="region"
            aria-label="Page feedback"
          >
            {visibility === 'thanks' ? (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pl-2" aria-live="polite">
                <p className="text-sm font-semibold text-foreground">Thanks for rating this page!</p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => setModalType('positive')}
                  >
                    Tell us more
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setVisibility('gone')}
                    aria-label="Dismiss"
                  >
                    <AqXClose className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4 pl-2">
                <h3 className="text-center sm:text-right text-sm font-semibold text-foreground">
                  Overall, how satisfied are you with {pageName}?
                </h3>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={handlePositive}
                    disabled={isSubmitting}
                    aria-label="Satisfied"
                    title="Satisfied"
                  >
                    <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setModalType('negative')}
                    disabled={isSubmitting}
                    aria-label="Not satisfied"
                    title="Not satisfied"
                  >
                    <ThumbsDown className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => openFeedbackDialog(`Page satisfaction: ${pageName}`)}
                    aria-label="Comment"
                    title="Report an issue or share an idea"
                  >
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={handleDismiss}
                    aria-label="Dismiss"
                    title="Dismiss"
                  >
                    <AqXClose className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            )}
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
