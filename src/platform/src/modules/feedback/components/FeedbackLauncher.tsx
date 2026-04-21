'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/shared/hooks/useUser';
import { Button, Input, Select, TextInput } from '@/shared/components/ui';
import ReusableDialog from '@/shared/components/ui/dialog';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { feedbackService } from '../services/feedbackService';
import { AqMessageCheckCircle } from '@airqo/icons-react';

type FeedbackCategory = 'bug' | 'feature' | 'support' | 'praise' | 'other';

const CATEGORY_OPTIONS: Array<{
  value: FeedbackCategory;
  label: string;
}> = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature request' },
  { value: 'support', label: 'Support' },
  { value: 'praise', label: 'Praise' },
  { value: 'other', label: 'Other' },
];

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

const RATING_LABELS: Record<number, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

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
  category: 'bug' as FeedbackCategory,
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
        className="fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6"
        initial={{ opacity: 0, y: 18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Button
          Icon={AqMessageCheckCircle}
          iconPosition="start"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-white/20 bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 px-5 py-3 text-white shadow-2xl shadow-emerald-950/20 hover:-translate-y-0.5 hover:shadow-emerald-950/30"
          paddingStyles="px-5 py-3"
          aria-label="Open feedback form"
        >
          Share feedback
        </Button>
      </motion.div>

      <ReusableDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Share feedback"
        subtitle="Tell us what is working, what is not, or what should be improved."
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
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-teal-50 via-background to-emerald-50 p-4 md:p-5 dark:from-teal-950/30 dark:via-background dark:to-emerald-950/20">
            <p className="text-sm font-medium text-foreground">
              We review every submission.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Include the page you were on, the browser you used, and a short
              description of the issue so we can reproduce it quickly.
            </p>
          </div>

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
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Experience rating
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {RATING_LABELS[rating]}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 = rough, 5 = smooth
                </p>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {RATING_OPTIONS.map(value => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? 'filled' : 'outlined'}
                    onClick={() => setRating(value)}
                    paddingStyles="px-3 py-2"
                    className="rounded-xl"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground">
              Auto-attached context: {defaultMetadata.page} •{' '}
              {defaultMetadata.browser} • {defaultMetadata.appVersion} •{' '}
              {defaultMetadata.screenResolution}
            </div>
          </div>
        </div>
      </ReusableDialog>
    </>
  );
};
