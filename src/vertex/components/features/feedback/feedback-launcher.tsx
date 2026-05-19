'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Rating, Star } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Flag, Lightbulb, ChevronLeft } from 'lucide-react';
import { AqXClose } from '@airqo/icons-react';

import { useUserContext } from '@/core/hooks/useUserContext';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableSelectInput from '@/components/shared/select/ReusableSelectInput';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { toast } from '@/components/shared/toast/ReusableToast';

import { feedbackService } from '@/core/apis/feedback';
import { uploadToCloudinary } from '@/core/apis/cloudinary';
import { FEEDBACK_DIALOG_OPEN_EVENT } from './feedback-dialog';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';

type MainCategory = 'issue' | 'idea';

const MAX_FEEDBACK_SCREENSHOT_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_FEEDBACK_SCREENSHOT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

const validateFeedbackScreenshotFile = (file: File) => {
  if (!file) {
    throw new Error('No screenshot selected.');
  }

  if (!ALLOWED_FEEDBACK_SCREENSHOT_MIME_TYPES.includes(file.type as typeof ALLOWED_FEEDBACK_SCREENSHOT_MIME_TYPES[number])) {
    throw new Error('Unsupported file format. Please upload JPG, PNG, GIF, or WEBP images.');
  }

  if (file.size > MAX_FEEDBACK_SCREENSHOT_SIZE_BYTES) {
    throw new Error('File is too large. Maximum allowed size is 2MB.');
  }
};

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
  activeFillColor: 'rgb(var(--primary))',
  inactiveFillColor: 'transparent',
  activeStrokeColor: 'rgb(var(--primary))',
  inactiveStrokeColor: 'rgb(var(--primary))',
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
  const { userDetails } = useUserContext();
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  
  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [issueAction, setIssueAction] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(3);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

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
      setScreenshotFile(null);
      setIsUploadingScreenshot(false);
      if (screenshotInputRef.current) {
        screenshotInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setScreenshotFile(null);
      return;
    }

    try {
      validateFeedbackScreenshotFile(file);
      setScreenshotFile(file);
    } catch (error) {
      setScreenshotFile(null);
      event.target.value = '';
      toast.error(
        'Invalid screenshot',
        error instanceof Error ? error.message : 'Please upload a valid image file.'
      );
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
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
      let screenshot_url: string | undefined;

      if (screenshotFile) {
        setIsUploadingScreenshot(true);

        try {
          const uploadedScreenshot = await uploadToCloudinary(screenshotFile, {
            folder: 'feedback',
            tags: ['vertex', 'feedback'],
          });

          screenshot_url = uploadedScreenshot.secure_url;
        } catch (error) {
          console.error('Screenshot upload failed, proceeding without it', error);
          toast.warning(
            'Screenshot upload failed',
            'We could not attach the screenshot to your feedback. Your feedback will still be submitted.'
          );
        } finally {
          setIsUploadingScreenshot(false);
        }
      }

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
        app: 'vertex',
        screenshot_url,
        metadata: defaultMetadata,
      });

      toast.success('Feedback sent successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? getApiErrorMessage(error) : 'An error occurred while submitting feedback');
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
        <ReusableSelectInput
          id="issueAction"
          label="When you noticed this issue, what were you trying to do? (required)"
          value={issueAction}
          onChange={(event) => setIssueAction(event.target.value)}
          required
          placeholder="Choose an option"
        >
          {ISSUE_ACTIONS.map(action => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </ReusableSelectInput>
      )}

      <div className="space-y-2">
        <label className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
          A screenshot will help us better understand the issue.
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
            Optional
          </span>
        </label>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 transition-colors hover:border-primary/60 dark:border-gray-700 dark:bg-gray-800">
          <label
            htmlFor="screenshot"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Capture screenshot
          </label>

          <input
            ref={screenshotInputRef}
            id="screenshot"
            type="file"
            accept={ALLOWED_FEEDBACK_SCREENSHOT_MIME_TYPES.join(',')}
            onChange={handleScreenshotChange}
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {screenshotFile ? screenshotFile.name : 'Capture screenshot'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, JPEG, PNG, GIF or WEBP. Maximum size {Math.round(MAX_FEEDBACK_SCREENSHOT_SIZE_BYTES / 1024 / 1024)}MB.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {screenshotFile && (
                <ReusableButton
                  variant="text"
                  onClick={handleRemoveScreenshot}
                  padding="px-3 py-2"
                  className="text-sm"
                  disabled={isSubmitting}
                >
                  Remove
                </ReusableButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReusableInputField
        as="textarea"
        id="message"
        label={mainCategory === 'issue' ? 'Describe the issue (required)' : 'Describe your suggestion (required)'}
        value={message}
        onChange={event => setMessage(event.target.value)}
        placeholder={mainCategory === 'issue' ? 'Explain what happened and what you expected' : 'Tell us how we can improve our product'}
        rows={5}
        required
        description="Please don't include any sensitive information"
      />

      <div>
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          Experience rating <span className="ml-1 text-primary">*</span>
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
    <ReusableDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={dialogTitle}
      size="xl"
      customHeader={mainCategory ? (
        <div className="flex items-center justify-between w-full px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ReusableButton 
              variant="text" 
              onClick={() => setMainCategory(null)} 
              padding="p-0" 
              className="h-8 w-8"
              Icon={ChevronLeft}
              aria-label="Go back"
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{dialogTitle}</h2>
          </div>
          <ReusableButton 
            variant="text" 
            onClick={() => setIsOpen(false)} 
            padding="p-0" 
            className="h-8 w-8"
            Icon={AqXClose}
            aria-label="Close dialog"
          />
        </div>
      ) : undefined}
      showFooter={!!mainCategory}
      primaryAction={mainCategory ? {
        label: isUploadingScreenshot ? 'Uploading...' : isSubmitting ? 'Sending...' : 'Send',
        onClick: handleSubmit,
        disabled: isSubmitting || isUploadingScreenshot,
      } : undefined}
      secondaryAction={mainCategory ? {
        label: 'Cancel',
        onClick: () => setIsOpen(false),
        disabled: isSubmitting || isUploadingScreenshot,
        variant: 'outline',
      } : undefined}
    >
      {!mainCategory ? renderStep1() : renderStep2()}
    </ReusableDialog>
  );
};
