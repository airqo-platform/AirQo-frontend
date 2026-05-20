'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Rating, Star } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Flag, Lightbulb, ChevronLeft, Monitor, X, ZoomIn, Pencil, RotateCcw, Check } from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MainCategory = 'issue' | 'idea';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const HIGHLIGHT_COLOR = 'rgba(239, 68, 68, 0.25)';   // semi-transparent red fill
const HIGHLIGHT_STROKE = 'rgba(239, 68, 68, 0.9)';   // solid red border

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    const ua = navigator.userAgent;
    const patterns: Array<{ label: string; pattern: RegExp }> = [
      { label: 'Edge', pattern: /Edg\/(\d+)/i },
      { label: 'Chrome', pattern: /Chrome\/(\d+)/i },
      { label: 'Firefox', pattern: /Firefox\/(\d+)/i },
      { label: 'Safari', pattern: /Version\/(\d+).+Safari/i },
    ];
    for (const { label, pattern } of patterns) {
      const m = ua.match(pattern);
      if (m?.[1]) return `${label} ${m[1]}`;
    }
    return ua.slice(0, 80);
  };

  return {
    page: pathname,
    browser: getBrowserLabel(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

/**
 * Flatten all drawn rectangles onto a copy of the base image and return a
 * new data-URL + File representing the annotated screenshot.
 */
const flattenAnnotations = (
  baseDataUrl: string,
  rects: Rect[],
  naturalWidth: number,
  naturalHeight: number,
): Promise<{ dataUrl: string; file: File }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);

      for (const r of rects) {
        ctx.fillStyle = HIGHLIGHT_COLOR;
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = HIGHLIGHT_STROKE;
        ctx.lineWidth = Math.max(2, naturalWidth / 500);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ dataUrl, file: new File([blob], 'screenshot.jpg', { type: 'image/jpeg' }) });
          } else {
            reject(new Error('toBlob returned null'));
          }
        },
        'image/jpeg',
        0.9,
      );
    };
    img.onerror = reject;
    img.src = baseDataUrl;
  });

// ---------------------------------------------------------------------------
// ScreenshotAnnotator
// ---------------------------------------------------------------------------
// A self-contained canvas editor that lets the user draw highlight rectangles
// on the captured screenshot before confirming.

interface ScreenshotAnnotatorProps {
  /** Raw (un-annotated) screenshot data URL */
  baseDataUrl: string;
  onConfirm: (rects: Rect[]) => void;
  onCancel: () => void;
}

const ScreenshotAnnotator: React.FC<ScreenshotAnnotatorProps> = ({
  baseDataUrl,
  onConfirm,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<Rect | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load the base image once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = baseDataUrl;
  }, [baseDataUrl]);

  // Redraw whenever rects or the current in-progress rect changes.
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const allRects = current ? [...rects, current] : rects;
    for (const r of allRects) {
      ctx.fillStyle = HIGHLIGHT_COLOR;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = HIGHLIGHT_STROKE;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
  }, [rects, current]);

  useEffect(() => {
    if (imgLoaded) redraw();
  }, [imgLoaded, redraw]);

  // Fit canvas to the image's natural dimensions on load, then scale via CSS.
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    redraw();
  }, [imgLoaded, redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPos(e);
    startRef.current = pos;
    setDrawing(true);
    setCurrent({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startRef.current) return;
    const pos = getPos(e);
    const x = Math.min(pos.x, startRef.current.x);
    const y = Math.min(pos.y, startRef.current.y);
    const w = Math.abs(pos.x - startRef.current.x);
    const h = Math.abs(pos.y - startRef.current.y);
    setCurrent({ x, y, w, h });
    redraw();
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startRef.current) return;
    const pos = getPos(e);
    const x = Math.min(pos.x, startRef.current.x);
    const y = Math.min(pos.y, startRef.current.y);
    const w = Math.abs(pos.x - startRef.current.x);
    const h = Math.abs(pos.y - startRef.current.y);
    // Ignore tiny accidental clicks (< 5px in either dimension).
    if (w > 5 && h > 5) {
      setRects((prev) => [...prev, { x, y, w, h }]);
    }
    setCurrent(null);
    setDrawing(false);
    startRef.current = null;
  };

  const handleUndo = () => setRects((prev) => prev.slice(0, -1));

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    onConfirm(
      // Scale rects back to natural image coordinates (canvas already uses natural coords)
      rects,
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Annotate screenshot"
    >
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-red-400" />
          <span className="text-sm font-semibold text-white">
            Draw rectangles to highlight areas of interest
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 ml-1">
            — click and drag on the image
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={rects.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <Check className="h-3.5 w-3.5" />
            Done
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        {!imgLoaded ? (
          <p className="text-sm text-gray-400">Loading screenshot…</p>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              cursor: 'crosshair',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 120px)',
              objectFit: 'contain',
              borderRadius: '8px',
              userSelect: 'none',
            }}
          />
        )}
      </div>

      {/* Hint footer */}
      <div className="shrink-0 py-2 text-center text-xs text-gray-500">
        {rects.length === 0
          ? 'No highlights yet — drag on the image to add one'
          : `${rects.length} highlight${rects.length > 1 ? 's' : ''} added`}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FeedbackLauncher
// ---------------------------------------------------------------------------

export const FeedbackLauncher: React.FC = () => {
  const pathname = usePathname();
  const { userDetails } = useUserContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [issueAction, setIssueAction] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(3);

  // Base (raw) screenshot — used as the source for the annotator.
  const [rawDataUrl, setRawDataUrl] = useState<string | null>(null);
  // Natural dimensions of the raw screenshot (needed for flatten).
  const [rawDimensions, setRawDimensions] = useState<{ w: number; h: number } | null>(null);

  // Final (annotated) screenshot shown in the form.
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  // UI state
  const [annotatorOpen, setAnnotatorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const defaultMetadata = useMemo(() => buildFeedbackMetadata(pathname || ''), [pathname]);

  // -------------------------------------------------------------------------
  // Event: open feedback dialog
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener(FEEDBACK_DIALOG_OPEN_EVENT, handler);
    return () => window.removeEventListener(FEEDBACK_DIALOG_OPEN_EVENT, handler);
  }, []);

  // -------------------------------------------------------------------------
  // Reset on close
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      setMainCategory(null);
      setIssueAction('');
      setMessage('');
      setRating(3);
      setRawDataUrl(null);
      setRawDimensions(null);
      setScreenshotDataUrl(null);
      setScreenshotFile(null);
      setAnnotatorOpen(false);
      setPreviewOpen(false);
    }
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // Capture — uses getDisplayMedia for pixel-perfect output
  // -------------------------------------------------------------------------
  const captureScreenshot = async () => {
    // 1. Hide the feedback dialog from the DOM so it won't appear in the capture.
    setIsCapturing(true);

    // 2. Give React one tick to flush the `hidden` class onto the wrapper div
    //    before the browser's share-picker is invoked.
    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false,
      } as DisplayMediaStreamOptions);

      const track = stream.getVideoTracks()[0];

      // 3. Wait for the track to reach "live" state — the picker has resolved
      //    and frames are actually flowing.
      await new Promise<void>((resolve) => {
        if (track.readyState === 'live') {
          resolve();
        } else {
          track.addEventListener('unmute', () => resolve(), { once: true });
        }
      });

      // 4. Extra delay to let the picker overlay finish animating out of the
      //    composited frame buffer before we grab.
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();

      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Store raw screenshot + dimensions, then open the annotator.
      setRawDataUrl(dataUrl);
      setRawDimensions({ w: bitmap.width, h: bitmap.height });
      setAnnotatorOpen(true);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotAllowedError') return; // user cancelled
      console.error('Screenshot capture failed:', error);
      toast.error('Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  };

  // -------------------------------------------------------------------------
  // Annotator callbacks
  // -------------------------------------------------------------------------

  /**
   * Called when the user clicks "Done" in the annotator.
   * Flattens the rectangles onto the image and stores the result.
   */
  const handleAnnotatorConfirm = async (rects: Rect[]) => {
    setAnnotatorOpen(false);

    if (!rawDataUrl || !rawDimensions) return;

    try {
      // If no highlights were drawn, use the raw screenshot as-is.
      if (rects.length === 0) {
        const img = new Image();
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = rej;
          img.src = rawDataUrl;
        });

        // Convert to File via an intermediate canvas.
        const canvas = document.createElement('canvas');
        canvas.width = rawDimensions.w;
        canvas.height = rawDimensions.h;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setScreenshotDataUrl(dataUrl);
              setScreenshotFile(new File([blob], 'screenshot.jpg', { type: 'image/jpeg' }));
              toast.success('Screenshot captured successfully');
            }
          },
          'image/jpeg',
          0.9,
        );
        return;
      }

      const { dataUrl, file } = await flattenAnnotations(
        rawDataUrl,
        rects,
        rawDimensions.w,
        rawDimensions.h,
      );

      setScreenshotDataUrl(dataUrl);
      setScreenshotFile(file);
      toast.success('Screenshot captured successfully');
    } catch {
      toast.error('Failed to process screenshot annotations');
    }
  };

  /** User cancelled the annotator — discard the raw capture. */
  const handleAnnotatorCancel = () => {
    setAnnotatorOpen(false);
    setRawDataUrl(null);
    setRawDimensions(null);
  };

  // -------------------------------------------------------------------------
  // Remove / re-capture
  // -------------------------------------------------------------------------
  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotDataUrl(null);
    setRawDataUrl(null);
    setRawDimensions(null);
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
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
          const uploaded = await uploadToCloudinary(screenshotFile, {
            folder: 'feedback',
            tags: ['vertex', 'feedback'],
          });
          screenshot_url = uploaded.secure_url;
        } catch (err) {
          console.error('Screenshot upload failed, proceeding without it', err);
          toast.warning(
            'Screenshot upload failed',
            'We could not attach the screenshot to your feedback. Your feedback will still be submitted.',
          );
        } finally {
          setIsUploadingScreenshot(false);
        }
      }

      const subject =
        mainCategory === 'issue' ? `Issue while trying to: ${issueAction}` : 'Product Suggestion';

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
      toast.error(
        error instanceof Error
          ? getApiErrorMessage(error)
          : 'An error occurred while submitting feedback',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

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
          onChange={(e) => setIssueAction(e.target.value)}
          required
          placeholder="Choose an option"
        >
          {ISSUE_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </ReusableSelectInput>
      )}

      <ReusableInputField
        as="textarea"
        id="message"
        label={
          mainCategory === 'issue' ? 'Describe the issue (required)' : 'Describe your suggestion (required)'
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          mainCategory === 'issue'
            ? 'Explain what happened and what you expected'
            : 'Tell us how we can improve our product'
        }
        rows={5}
        required
        description="Please don't include any sensitive information"
      />

      {/* Screenshot section */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          A screenshot will help us better understand {mainCategory === 'issue' ? 'the issue' : 'your idea'}.
        </p>

        {screenshotFile && screenshotDataUrl ? (
          <div className="space-y-2">
            {/* Thumbnail — click to open full preview */}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="group relative w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Preview screenshot"
            >
              <img
                src={screenshotDataUrl}
                alt="Captured screenshot"
                className="h-32 w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-900/90 dark:text-gray-100">
                  <ZoomIn className="h-3.5 w-3.5" />
                  Preview
                </div>
              </div>
            </button>

            {/* File info + actions */}
            <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 min-w-0">
                <Monitor className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
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
                className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isCapturing}
            onClick={captureScreenshot}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm font-medium text-blue-500 hover:bg-gray-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            <Monitor className="h-4 w-4" />
            <span>{isCapturing ? 'Capturing…' : 'Capture screenshot'}</span>
          </button>
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          Experience rating <span className="ml-1 text-primary">*</span>
        </label>
        <div className="w-full max-w-[200px]">
          <Rating value={rating} onChange={setRating} isRequired itemStyles={RATING_ITEM_STYLES} />
        </div>
      </div>
    </div>
  );

  const dialogTitle = mainCategory
    ? mainCategory === 'issue'
      ? 'Report an issue'
      : 'Suggest an idea'
    : 'Send feedback to AirQo';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      {/* Wrapper is hidden while capturing so the modal is excluded from the frame. */}
      <div className={isCapturing ? 'invisible pointer-events-none' : ''}>
      {/* Main feedback dialog */}
      <ReusableDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={dialogTitle}
        size="xl"
        customHeader={
          mainCategory ? (
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {dialogTitle}
                </h2>
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
          ) : undefined
        }
        showFooter={!!mainCategory}
        primaryAction={
          mainCategory
            ? {
                label: isUploadingScreenshot ? 'Uploading…' : isSubmitting ? 'Sending…' : 'Send',
                onClick: handleSubmit,
                disabled: isSubmitting || isUploadingScreenshot,
              }
            : undefined
        }
        secondaryAction={
          mainCategory
            ? {
                label: 'Cancel',
                onClick: () => setIsOpen(false),
                disabled: isSubmitting || isUploadingScreenshot,
                variant: 'outline',
              }
            : undefined
        }
      >
        {!mainCategory ? renderStep1() : renderStep2()}
      </ReusableDialog>
      </div>

      {/* Screenshot annotator — full-screen, rendered outside the dialog */}
      {annotatorOpen && rawDataUrl && (
        <ScreenshotAnnotator
          baseDataUrl={rawDataUrl}
          onConfirm={handleAnnotatorConfirm}
          onCancel={handleAnnotatorCancel}
        />
      )}

      {/* Full-size preview modal */}
      {previewOpen && screenshotDataUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={screenshotDataUrl}
              alt="Screenshot preview"
              className="block rounded-xl"
              style={{ maxHeight: '85vh', maxWidth: '85vw', objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};