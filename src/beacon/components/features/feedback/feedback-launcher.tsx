'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Rating, Star } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Flag, Lightbulb, ChevronLeft, ImagePlus, Loader2, Monitor, ZoomIn } from 'lucide-react';

import authService from '@/services/api-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useGroup } from '@/lib/group-context';
import { getPageTitle } from '@/lib/navigation';

import { feedbackService, getAppVersion } from '@/services/feedback.service';
import { FEEDBACK_DIALOG_OPEN_EVENT, FeedbackDialogOpenDetail } from './feedback-dialog';
import { ScreenshotAnnotator, ScreenshotPreview } from './screenshot-annotator';
import {
  HighlightRect,
  captureTabFrame,
  isScreenCaptureSupported,
  readImageFile,
  renderAnnotatedScreenshot,
} from './screenshot-tools';

type MainCategory = 'issue' | 'idea';

interface FieldErrors {
  issueAction?: string;
  message?: string;
}

/** Thank-you copy, matched to the contact-consent choice. */
const THANK_YOU_WITH_CONSENT =
  "Thanks — we'll email you if we need more details or when it's resolved.";
const THANK_YOU_WITHOUT_CONSENT =
  "Thanks — we've received it. We won't contact you about this.";

const ISSUE_ACTIONS = [
  'Viewing my devices',
  'Viewing organisation devices',
  'Device details or configuration',
  'Device diagnostics',
  'Remote terminal',
  'Maintenance map',
  'Performance analysis',
  'Device data analysis',
  'Reports and data export',
  'Alerts',
  'Firmware management',
  'Collocation',
  'Stock and inventory',
  'Account and settings',
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

/** Lets the dialog's close animation finish so it stays out of the capture. */
const DIALOG_EXIT_MS = 300;

/**
 * Screenshots upload through Cloudinary, which Beacon isn't configured for
 * yet. Turn this on once CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and
 * CLOUDINARY_API_SECRET are set in the deployment.
 */
const SCREENSHOTS_ENABLED = false;

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

/** Read at submit time so it describes the page the person was on. */
const buildFeedbackMetadata = (pathname: string) => {
  if (typeof window === 'undefined') {
    return {
      page: pathname,
      browser: 'Unknown browser',
      appVersion: getAppVersion(),
      screenResolution: 'Unknown',
    };
  }

  return {
    page: pathname,
    pageTitle: getPageTitle(pathname, new URLSearchParams(window.location.search)),
    browser: getBrowserLabel(),
    appVersion: getAppVersion(),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
};

export const FeedbackLauncher: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { activeGroup } = useGroup();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  // Which dialog (if any) the feedback flow was launched from — included in metadata.
  const [sourceDialog, setSourceDialog] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);

  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [issueAction, setIssueAction] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(3);
  // People reporting a problem usually want to hear back, so this starts on.
  const [contactConsent, setContactConsent] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Raw screenshot — the annotator draws on top of it.
  const [rawDataUrl, setRawDataUrl] = useState<string | null>(null);
  // Final (annotated) screenshot attached to the report.
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const [annotatorOpen, setAnnotatorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [canCaptureScreen, setCanCaptureScreen] = useState(false);

  useEffect(() => {
    setCanCaptureScreen(isScreenCaptureSupported());
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<FeedbackDialogOpenDetail>).detail;
      setSourceDialog(detail?.source || null);
      setIsOpen(true);
    };
    window.addEventListener(FEEDBACK_DIALOG_OPEN_EVENT, handler);
    return () => window.removeEventListener(FEEDBACK_DIALOG_OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSourceDialog(null);
      setMainCategory(null);
      setIssueAction('');
      setMessage('');
      setRating(3);
      setContactConsent(true);
      setFieldErrors({});
      setFormError(null);
      setRawDataUrl(null);
      setScreenshotDataUrl(null);
      setScreenshotFile(null);
      setAnnotatorOpen(false);
      setPreviewOpen(false);
    }
  }, [isOpen]);

  const isBusy = isSubmitting || isUploadingScreenshot;

  // -------------------------------------------------------------------------
  // Screenshot: capture or attach, then annotate
  // -------------------------------------------------------------------------
  const captureScreenshot = async () => {
    setFormError(null);
    // The dialog closes while capturing so it isn't in the frame; its state is kept.
    setIsCapturing(true);
    await new Promise<void>((resolve) => setTimeout(resolve, DIALOG_EXIT_MS));

    try {
      setRawDataUrl(await captureTabFrame());
      setAnnotatorOpen(true);
    } catch (error: unknown) {
      // NotAllowedError: the person cancelled the share picker.
      if (!(error instanceof Error && error.name === 'NotAllowedError')) {
        setFormError('We could not capture a screenshot. You can attach an image instead.');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleImagePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Let the same file be picked again after it is removed.
    event.target.value = '';
    if (!file) return;

    setFormError(null);
    try {
      setRawDataUrl(await readImageFile(file));
      setAnnotatorOpen(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not read that image.');
    }
  };

  const handleAnnotatorConfirm = useCallback(
    async (rects: HighlightRect[]) => {
      setAnnotatorOpen(false);
      if (!rawDataUrl) return;

      setIsProcessingScreenshot(true);
      try {
        const { dataUrl, file } = await renderAnnotatedScreenshot(rawDataUrl, rects);
        setScreenshotDataUrl(dataUrl);
        setScreenshotFile(file);
      } catch {
        setFormError('We could not process that screenshot. Please try again.');
      } finally {
        setIsProcessingScreenshot(false);
      }
    },
    [rawDataUrl]
  );

  /** Cancelling the annotator discards the raw capture. */
  const handleAnnotatorCancel = useCallback(() => {
    setAnnotatorOpen(false);
    setRawDataUrl(null);
  }, []);

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotDataUrl(null);
    setRawDataUrl(null);
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    const storedUser = authService.getUserData();
    const userEmail = session?.user?.email || storedUser?.email || storedUser?.userName || '';

    const errors: FieldErrors = {};
    if (mainCategory === 'issue' && !issueAction) {
      errors.issueAction = 'Please select what you were trying to do.';
    }
    if (!trimmedMessage) {
      errors.message = 'Please provide a description.';
    }
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    if (!userEmail) {
      setFormError('Unable to identify your account. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshot_url: string | undefined;
      let screenshotFailed = false;

      if (screenshotFile) {
        setIsUploadingScreenshot(true);
        try {
          screenshot_url = (await feedbackService.uploadScreenshot(screenshotFile)).secure_url;
        } catch (error) {
          // The report matters more than the picture: send it without one.
          console.warn('Feedback screenshot upload failed:', error);
          screenshotFailed = true;
        } finally {
          setIsUploadingScreenshot(false);
        }
      }

      const subject =
        mainCategory === 'issue' ? `Issue while trying to: ${issueAction}` : 'Product Suggestion';
      const metadata = buildFeedbackMetadata(pathname || '');

      await feedbackService.submitFeedback({
        email: userEmail,
        subject,
        message: trimmedMessage,
        rating,
        category: mainCategory === 'issue' ? 'bug' : 'feature_request',
        platform: 'web',
        app: 'beacon',
        contact_consent: contactConsent,
        screenshot_url,
        metadata: {
          ...metadata,
          ...(activeGroup ? { activeGroup } : {}),
          ...(sourceDialog ? { sourceDialog } : {}),
        },
      });

      setIsOpen(false);

      const thankYou = contactConsent ? THANK_YOU_WITH_CONSENT : THANK_YOU_WITHOUT_CONSENT;
      toast({
        title: screenshotFailed ? 'Feedback sent without the screenshot' : 'Feedback sent',
        description: screenshotFailed
          ? `We couldn't attach your screenshot, but your feedback was submitted. ${thankYou}`
          : thankYou,
      });
    } catch (error) {
      setFormError(
        error instanceof Error && error.message
          ? error.message
          : 'Oops! An error occurred while submitting your feedback. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const renderStep1 = () => (
    <div className="flex flex-col gap-4 py-4">
      <button
        type="button"
        onClick={() => setMainCategory('issue')}
        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
          <Flag className="h-5 w-5" />
        </div>
        <span className="text-lg font-medium text-gray-900 dark:text-white">Report an issue</span>
      </button>

      <button
        type="button"
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

  const renderScreenshotSection = () => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
        A screenshot will help us better understand {mainCategory === 'issue' ? 'the issue' : 'your idea'}.
      </p>

      {screenshotFile && screenshotDataUrl ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group relative w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Preview screenshot"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotDataUrl}
              alt="Attached screenshot"
              className="h-32 w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
              <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-gray-900/90 dark:text-gray-100">
                <ZoomIn className="h-3.5 w-3.5" />
                Preview
              </div>
            </div>
          </button>

          <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800/30">
            <div className="flex items-center gap-2 min-w-0">
              <Monitor className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-gray-700 dark:text-gray-300 font-medium">
                {screenshotFile.name}
              </span>
              <span className="text-xs text-gray-500 shrink-0">
                ({(screenshotFile.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveScreenshot}
              disabled={isBusy}
              className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          {canCaptureScreen && (
            <button
              type="button"
              disabled={isCapturing || isProcessingScreenshot || isBusy}
              onClick={captureScreenshot}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm font-medium text-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
            >
              {isProcessingScreenshot ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              <span>{isCapturing ? 'Capturing…' : 'Capture screenshot'}</span>
            </button>
          )}
          <button
            type="button"
            disabled={isProcessingScreenshot || isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm font-medium text-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            {isProcessingScreenshot && !canCaptureScreen ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <span>Attach image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImagePicked}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-6 py-2">
      {mainCategory === 'issue' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="feedback-issue-action" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            When you noticed this issue, what were you trying to do? (required)
          </Label>
          <Select
            value={issueAction}
            onValueChange={(value) => {
              setIssueAction(value);
              setFieldErrors((prev) => ({ ...prev, issueAction: undefined }));
            }}
            disabled={isBusy}
          >
            <SelectTrigger
              id="feedback-issue-action"
              aria-invalid={Boolean(fieldErrors.issueAction)}
              className={fieldErrors.issueAction ? 'border-destructive' : undefined}
            >
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
          {fieldErrors.issueAction && (
            <p className="text-xs text-destructive">{fieldErrors.issueAction}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-message" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {mainCategory === 'issue' ? 'Describe the issue (required)' : 'Describe your suggestion (required)'}
        </Label>
        <Textarea
          id="feedback-message"
          value={message}
          onChange={event => {
            setMessage(event.target.value);
            if (event.target.value.trim()) {
              setFieldErrors((prev) => ({ ...prev, message: undefined }));
            }
          }}
          placeholder={mainCategory === 'issue' ? 'Explain what happened and what you expected' : 'Tell us how we can improve our product'}
          rows={5}
          required
          disabled={isBusy}
          aria-invalid={Boolean(fieldErrors.message)}
          className={fieldErrors.message ? 'border-destructive' : undefined}
        />
        {fieldErrors.message ? (
          <p className="text-xs text-destructive">{fieldErrors.message}</p>
        ) : (
          <p className="text-xs text-gray-500">Please don&apos;t include any sensitive information</p>
        )}
      </div>

      {SCREENSHOTS_ENABLED && renderScreenshotSection()}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          Experience rating <span className="ml-1 text-primary">*</span>
        </p>
        <div className="w-full max-w-[200px]">
          <Rating
            value={rating}
            onChange={setRating}
            isRequired
            isDisabled={isBusy}
            itemStyles={RATING_ITEM_STYLES}
          />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="contact-consent"
          checked={contactConsent}
          onCheckedChange={checked => setContactConsent(checked === true)}
          disabled={isBusy}
          className="mt-0.5"
        />
        <Label
          htmlFor="contact-consent"
          className="text-sm font-normal leading-snug text-gray-700 dark:text-gray-200"
        >
          It&apos;s OK to contact me about this
        </Label>
      </div>

      {formError && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
    </div>
  );

  const dialogTitle = mainCategory
    ? (mainCategory === 'issue' ? 'Report an issue' : 'Suggest an idea')
    : 'Send feedback to AirQo';

  return (
    <>
      <Dialog
        open={isOpen && !isCapturing && !annotatorOpen}
        onOpenChange={(open) => {
          if (!open && !isBusy) setIsOpen(false);
        }}
      >
        <DialogContent
          className="sm:max-w-xl max-h-[90vh] overflow-y-auto"
          showFeedbackButton={false}
        >
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              {mainCategory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setMainCategory(null);
                    setFieldErrors({});
                    setFormError(null);
                  }}
                  disabled={isBusy}
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
            <DialogDescription className="sr-only">
              Report a problem with Beacon or suggest an improvement.
            </DialogDescription>
          </DialogHeader>

          {!mainCategory ? renderStep1() : renderStep2()}

          {mainCategory && (
            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isBusy || isProcessingScreenshot}
              >
                {isUploadingScreenshot ? 'Uploading…' : isSubmitting ? 'Sending…' : 'Send'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {annotatorOpen && rawDataUrl && (
        <ScreenshotAnnotator
          baseDataUrl={rawDataUrl}
          onConfirm={handleAnnotatorConfirm}
          onCancel={handleAnnotatorCancel}
        />
      )}

      {previewOpen && screenshotDataUrl && (
        <ScreenshotPreview src={screenshotDataUrl} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
};
