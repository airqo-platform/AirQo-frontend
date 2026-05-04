'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Rating, Star } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';

import { useUserContext } from '@/core/hooks/useUserContext';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableSelectInput from '@/components/shared/select/ReusableSelectInput';
import { toast } from '@/components/shared/toast/ReusableToast';

import { feedbackService } from '@/core/apis/feedback';
import { FEEDBACK_DIALOG_OPEN_EVENT } from './feedback-dialog';

type FeedbackCategory =
  | 'general'
  | 'bug'
  | 'feature_request'
  | 'performance'
  | 'ux_design'
  | 'other';

const CATEGORY_OPTIONS: Array<{
  value: FeedbackCategory;
  label: string;
}> = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'performance', label: 'Performance' },
  { value: 'ux_design', label: 'UX / Design' },
  { value: 'other', label: 'Other' },
];

const RATING_ITEM_STYLES = {
  itemShapes: Star,
  activeFillColor: 'hsl(var(--primary))',
  inactiveFillColor: 'hsl(var(--muted))',
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getBrowserLabel = (): string => {
  if (typeof navigator === 'undefined') {
    return 'Unknown browser';
  }

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

const buildFeedbackMetadata = (pathname: string) => {
  if (typeof window === 'undefined') {
    return {
      page: pathname,
      browser: 'Unknown browser',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      screenResolution: 'Unknown',
    };
  }

  return {
    page: pathname,
    browser: getBrowserLabel(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

const resetFormState = () => ({
  category: 'general' as FeedbackCategory,
  rating: 3,
  subject: '',
  message: '',
});

export const FeedbackLauncher: React.FC = () => {
  const pathname = usePathname();
  const { userDetails } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [rating, setRating] = useState<number>(3);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

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
      return;
    }

    const userEmail = userDetails?.email || userDetails?.userName || '';
    setEmail(userEmail);
    const nextDefaults = resetFormState();
    setCategory(nextDefaults.category);
    setRating(nextDefaults.rating);
    setSubject(nextDefaults.subject);
    setMessage(nextDefaults.message);
  }, [isOpen, userDetails]);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedSubject || !trimmedMessage) {
      toast.error('Please complete the email, subject, and message fields.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.submitFeedback({
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
        rating,
        category,
        platform: 'web',
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

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Share feedback"
      subtitle="Help us improve your experience. Tell us what's working well, what could be better, or any problems you've faced."
      size="2xl"
      primaryAction={{
        label: isSubmitting ? 'Sending...' : 'Send feedback',
        onClick: handleSubmit,
        disabled: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => setIsOpen(false),
        disabled: isSubmitting,
        variant: 'outline',
      }}
    >
      <div className="grid gap-6 py-4 md:grid-cols-2">
        <ReusableInputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="you@airqo.net"
          required
        />

        <ReusableSelectInput
          id="category"
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
          required
          placeholder="Select category"
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ReusableSelectInput>

        <div className="md:col-span-2">
          <ReusableInputField
            id="subject"
            label="Subject"
            value={subject}
            onChange={event => setSubject(event.target.value)}
            placeholder="Bug: Export CSV button not working"
            required
          />
        </div>

        <div className="md:col-span-2">
          <ReusableInputField
            as="textarea"
            id="message"
            label="Message"
            value={message}
            onChange={event => setMessage(event.target.value)}
            placeholder="Describe what happened, what you expected, and any error details you saw."
            rows={5}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
            Experience rating <span style={{ color: "hsl(var(--primary))" }} className="ml-1">*</span>
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
    </ReusableDialog>
  );
};
