'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tooltip } from 'flowbite-react';
import { Rating, Star } from '@smastrom/react-rating';
import { useUser } from '@/shared/hooks/useUser';
import { Input, Select, TextInput } from '@/shared/components/ui';
import ReusableDialog from '@/shared/components/ui/dialog';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { feedbackService } from '../services/feedbackService';
import { AqMessageNotificationSquare } from '@airqo/icons-react';

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
  // Use app primary color from CSS variables for consistency
  activeFillColor: 'rgb(var(--primary-700))',
  inactiveFillColor: '#dbe4ea',
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
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [rating, setRating] = useState<number>(3);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const defaultMetadata = useMemo(
    () => buildFeedbackMetadata(pathname),
    [pathname]
  );

  const shouldHideLauncher =
    pathname.startsWith('/system/feedback') || pathname.includes('/map');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEmail(user?.email || '');
    const nextDefaults = resetFormState();
    setCategory(nextDefaults.category);
    setRating(nextDefaults.rating);
    setSubject(nextDefaults.subject);
    setMessage(nextDefaults.message);
  }, [isOpen, user?.email]);

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
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (shouldHideLauncher) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed bottom-3 right-3 z-40 md:bottom-4 md:right-5"
        initial={{ opacity: 0, y: 18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Tooltip
          content="Need to report an Issue or share an idea?"
          placement="left"
          style="dark"
        >
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white shadow-2xl shadow-emerald-950/20 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
            style={{ backgroundColor: 'rgb(var(--primary-700))' }}
            aria-label="Open feedback form"
          >
            <AqMessageNotificationSquare
              className="h-6 w-6"
              aria-hidden="true"
            />
          </motion.button>
        </Tooltip>
      </motion.div>

      <ReusableDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Share feedback"
        subtitle="Help us improve your experience. Tell us what’s working well, what could be better, or any problems you’ve faced."
        size="xl"
        primaryAction={{
          label: isSubmitting ? 'Sending...' : 'Send feedback',
          onClick: handleSubmit,
          loading: isSubmitting,
          disabled: isSubmitting,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsOpen(false),
          disabled: isSubmitting,
          variant: 'outlined',
        }}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={event => setEmail(String(event.target.value || ''))}
              placeholder="you@airqo.net"
              required
              containerClassName="md:col-span-1"
            />

            <Select
              label="Category"
              value={category}
              onChange={event =>
                setCategory(
                  String(event.target.value || 'bug') as FeedbackCategory
                )
              }
              required
              containerClassName="md:col-span-1"
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Input
              label="Subject"
              value={subject}
              onChange={event => setSubject(String(event.target.value || ''))}
              placeholder="Bug: Export CSV button not working"
              required
              containerClassName="md:col-span-2"
            />

            <TextInput
              label="Message"
              value={message}
              onChange={event => setMessage(String(event.target.value || ''))}
              placeholder="Describe what happened, what you expected, and any error details you saw."
              rows={6}
              required
              containerClassName="md:col-span-2"
            />

            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  Experience rating
                </p>
              </div>

              <div className="mt-3">
                <Rating
                  value={rating}
                  onChange={setRating}
                  isRequired
                  style={{ maxWidth: 240 }}
                  itemStyles={RATING_ITEM_STYLES}
                />
              </div>
            </div>
          </div>
        </div>
      </ReusableDialog>
    </>
  );
};
