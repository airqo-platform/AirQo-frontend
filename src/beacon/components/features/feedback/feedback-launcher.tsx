'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Rating, Star } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Flag, Lightbulb, ChevronLeft, X } from 'lucide-react';
import { AqXClose } from '@airqo/icons-react';

import authService from '@/services/api-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { feedbackService } from '@/services/feedback.service';
import { FEEDBACK_DIALOG_OPEN_EVENT } from './feedback-dialog';

type MainCategory = 'issue' | 'idea';

const ISSUE_ACTIONS = [
  'Claiming devices',
  'Deploying devices',
  'Recalling devices',
  'Sharing data',
  'Device metadata',
  'General navigation',
  'Other',
];

const RATING_ITEM_STYLES = {
  itemShapes: Star,
  activeFillColor: 'rgb(var(--primary, 37 99 235))', // fallback to blue if var not defined
  inactiveFillColor: 'transparent',
  activeStrokeColor: 'rgb(var(--primary, 37 99 235))',
  inactiveStrokeColor: 'rgb(var(--primary, 37 99 235))',
  itemStrokeWidth: 2,
};

const buildFeedbackMetadata = (pathname: string) => {
  if (typeof window === 'undefined') {
    return {
      page: pathname,
      browser: 'Unknown browser',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      screenResolution: 'Unknown',
    };
  }

  const getBrowserLabel = (): string => {
    const userAgent = navigator.userAgent;
    const browserPatterns: Array<{ label: string; pattern: RegExp }> = [
      { label: 'Edge', pattern: /Edg\/(\d+)/i },
      { label: 'Chrome', pattern: /Chrome\/(\d+)/i },
      { label: 'Firefox', pattern: /Firefox\/(\d+)/i },
      { label: 'Safari', pattern: /Version\/(\d+).+Safari/i },
    ];

    for (const browser of browserPatterns) {
      const match = userAgent.match(browser.pattern);
      if (match?.[1]) {
        return `${browser.label} ${match[1]}`;
      }
    }
    return userAgent.slice(0, 80);
  };

  return {
    page: pathname,
    browser: getBrowserLabel(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

export const FeedbackLauncher: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [issueAction, setIssueAction] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(3);

  const defaultMetadata = useMemo(
    () => buildFeedbackMetadata(pathname || ''),
    [pathname]
  );

  useEffect(() => {
    const handleOpenFeedbackDialog = () => {
      setIsOpen(true);
    };

    window.addEventListener(
      FEEDBACK_DIALOG_OPEN_EVENT,
      handleOpenFeedbackDialog
    );

    return () => {
      window.removeEventListener(
        FEEDBACK_DIALOG_OPEN_EVENT,
        handleOpenFeedbackDialog
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMainCategory(null);
      setIssueAction('');
      setMessage('');
      setRating(3);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    const userDetails = authService.getUserData();
    const userEmail = userDetails?.email || userDetails?.userName || '';

    if (!trimmedMessage) {
      toast.error('Please provide a description.');
      return;
    }

    if (mainCategory === 'issue' && !issueAction) {
      toast.error('Please select what you were trying to do.');
      return;
    }

    if (!userEmail) {
      toast.error('Unable to identify your account. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = mainCategory === 'issue' 
        ? `Issue while trying to: ${issueAction}`
        : 'Product Suggestion';

      await feedbackService.submitFeedback({
        email: userEmail,
        subject,
        message: trimmedMessage,
        rating,
        category: mainCategory === 'issue' ? 'bug' : 'feature_request',
        platform: 'web',
        app: 'beacon', // Changed from vertex to beacon
        metadata: defaultMetadata,
      });

      toast.success('Feedback sent successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="flex flex-col gap-4 py-4">
      <button
        onClick={() => setMainCategory('issue')}
        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
          <Flag className="h-5 w-5" />
        </div>
        <span className="text-lg font-medium text-gray-900 dark:text-white">Report an issue</span>
      </button>

      <button
        onClick={() => setMainCategory('idea')}
        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
          <Lightbulb className="h-5 w-5" />
        </div>
        <span className="text-lg font-medium text-gray-900 dark:text-white">Suggest an idea</span>
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-6 py-2">
      {mainCategory === 'issue' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            When you noticed this issue, what were you trying to do? (required)
          </label>
          <Select value={issueAction} onValueChange={setIssueAction}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              {ISSUE_ACTIONS.map(action => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {mainCategory === 'issue' ? 'Describe the issue (required)' : 'Describe your suggestion (required)'}
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder={mainCategory === 'issue' ? 'Explain what happened and what you expected' : 'Tell us how we can improve our product'}
          rows={5}
          required
        />
        <p className="text-xs text-gray-500">Please don&apos;t include any sensitive information</p>
      </div>

      <div>
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          Experience rating <span className="ml-1 text-blue-600">*</span>
        </label>
        <div className="w-full max-w-[200px]">
          <Rating
            value={rating}
            onChange={setRating}
            isRequired
            itemStyles={RATING_ITEM_STYLES}
          />
        </div>
      </div>
    </div>
  );

  const dialogTitle = mainCategory 
    ? (mainCategory === 'issue' ? 'Report an issue' : 'Suggest an idea') 
    : 'Send feedback to AirQo';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            {mainCategory && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMainCategory(null)} 
                className="h-8 w-8"
                aria-label="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {dialogTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        {!mainCategory ? renderStep1() : renderStep2()}

        {mainCategory && (
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
