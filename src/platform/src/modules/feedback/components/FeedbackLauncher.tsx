'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Rating, Star } from '@smastrom/react-rating';
import { AqMonitor03, AqTrash01, AqUploadCloud01 } from '@airqo/icons-react';
import { FiCheck, FiEdit2, FiRotateCcw, FiX, FiZoomIn } from 'react-icons/fi';
import { useUser } from '@/shared/hooks/useUser';
import { Button, Select, TextInput } from '@/shared/components/ui';
import ReusableDialog from '@/shared/components/ui/dialog';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  MAX_IMAGE_FILE_SIZE_BYTES,
  PROFILE_IMAGE_ALLOWED_MIME_TYPES,
  uploadToCloudinary,
  validateImageFile,
} from '@/shared/utils/cloudinaryUpload';
import { feedbackService } from '../services/feedbackService';
import { FEEDBACK_DIALOG_OPEN_EVENT } from '../utils/feedbackDialog';

type FeedbackCategory =
  | 'general'
  | 'bug'
  | 'feature_request'
  | 'performance'
  | 'ux_design'
  | 'other';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

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

const SENSITIVE_QUERY_KEYS = new Set([
  'code',
  'state',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'session',
  'auth',
  'nonce',
  'secret',
]);

const FEEDBACK_APP_NAME = 'Analytics';
const SCREENSHOT_ACCEPT = [...PROFILE_IMAGE_ALLOWED_MIME_TYPES].join(',');
const HIGHLIGHT_COLOR = 'rgba(239, 68, 68, 0.25)';
const HIGHLIGHT_STROKE = 'rgba(239, 68, 68, 0.9)';

const getCategoryLabel = (category: FeedbackCategory) =>
  CATEGORY_OPTIONS.find(option => option.value === category)?.label ||
  'General';

const buildDefaultFeedbackSubject = (category: FeedbackCategory) =>
  `${FEEDBACK_APP_NAME} feedback - ${getCategoryLabel(category)}`;

const isCancelledCaptureError = (error: unknown): boolean => {
  const name = (error as { name?: string })?.name;
  return name === 'AbortError' || name === 'NotAllowedError';
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read the selected screenshot.'));
    };
    reader.onerror = () => {
      reject(
        reader.error || new Error('Failed to read the selected screenshot.')
      );
    };
    reader.readAsDataURL(file);
  });

const canvasToScreenshotCapture = (
  canvas: HTMLCanvasElement
): Promise<{ dataUrl: string; file: File; width: number; height: number }> => {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Failed to create the screenshot file.'));
          return;
        }

        resolve({
          dataUrl,
          file: new File([blob], 'feedback-screenshot.jpg', {
            type: 'image/jpeg',
          }),
          width: canvas.width,
          height: canvas.height,
        });
      },
      'image/jpeg',
      0.9
    );
  });
};

const flattenAnnotations = (
  baseDataUrl: string,
  rects: Rect[],
  naturalWidth: number,
  naturalHeight: number
): Promise<{ dataUrl: string; file: File }> =>
  new Promise((resolve, reject) => {
    const sourceImage = new window.Image();

    sourceImage.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Failed to prepare the screenshot canvas.'));
          return;
        }

        context.drawImage(sourceImage, 0, 0);

        for (const rect of rects) {
          context.fillStyle = HIGHLIGHT_COLOR;
          context.fillRect(rect.x, rect.y, rect.w, rect.h);
          context.strokeStyle = HIGHLIGHT_STROKE;
          context.lineWidth = Math.max(2, naturalWidth / 500);
          context.strokeRect(rect.x, rect.y, rect.w, rect.h);
        }

        const { dataUrl, file } = await canvasToScreenshotCapture(canvas);
        resolve({ dataUrl, file });
      } catch (error) {
        reject(error);
      }
    };

    sourceImage.onerror = () => {
      reject(new Error('Failed to load the screenshot for annotation.'));
    };

    sourceImage.src = baseDataUrl;
  });

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

const buildSanitizedPageValue = (fallbackPathname: string): string => {
  if (typeof window === 'undefined') {
    return fallbackPathname;
  }

  const { pathname, search } = window.location;

  if (!search) {
    return pathname;
  }

  const searchParams = new URLSearchParams(search);

  for (const key of Array.from(searchParams.keys())) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      searchParams.delete(key);
    }
  }

  const safeQuery = searchParams.toString();
  return safeQuery ? `${pathname}?${safeQuery}` : pathname;
};

const buildFeedbackMetadata = (pathname: string) => {
  const page = buildSanitizedPageValue(pathname);

  if (typeof window === 'undefined') {
    return {
      page,
      browser: 'Unknown browser',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      screenResolution: 'Unknown',
    };
  }

  return {
    page,
    browser: getBrowserLabel(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

const resetFormState = () => ({
  category: 'general' as FeedbackCategory,
  rating: 3,
  message: '',
});

interface ScreenshotAnnotatorProps {
  baseDataUrl: string;
  onConfirm: (rects: Rect[]) => void;
  onCancel: () => void;
}

const ScreenshotAnnotator: React.FC<ScreenshotAnnotatorProps> = ({
  baseDataUrl,
  onConfirm,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<Rect | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.onload = () => {
      imageRef.current = nextImage;
      setImageLoaded(true);
    };
    nextImage.onerror = () => {
      setImageLoaded(false);
    };
    nextImage.src = baseDataUrl;
  }, [baseDataUrl]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const sourceImage = imageRef.current;
    if (!canvas || !sourceImage) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

    const allRects = currentRect ? [...rects, currentRect] : rects;
    for (const rect of allRects) {
      context.fillStyle = HIGHLIGHT_COLOR;
      context.fillRect(rect.x, rect.y, rect.w, rect.h);
      context.strokeStyle = HIGHLIGHT_STROKE;
      context.lineWidth = 2;
      context.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
  }, [currentRect, rects]);

  useEffect(() => {
    if (!imageLoaded) {
      return;
    }

    redraw();
  }, [imageLoaded, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sourceImage = imageRef.current;
    if (!canvas || !sourceImage || !imageLoaded) {
      return;
    }

    canvas.width = sourceImage.naturalWidth;
    canvas.height = sourceImage.naturalHeight;
    redraw();
  }, [imageLoaded, redraw]);

  const getPosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const position = getPosition(event);
    startRef.current = position;
    setDrawing(true);
    setCurrentRect({ x: position.x, y: position.y, w: 0, h: 0 });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startRef.current) {
      return;
    }

    const position = getPosition(event);
    const x = Math.min(position.x, startRef.current.x);
    const y = Math.min(position.y, startRef.current.y);
    const w = Math.abs(position.x - startRef.current.x);
    const h = Math.abs(position.y - startRef.current.y);

    setCurrentRect({ x, y, w, h });
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startRef.current) {
      return;
    }

    const position = getPosition(event);
    const x = Math.min(position.x, startRef.current.x);
    const y = Math.min(position.y, startRef.current.y);
    const w = Math.abs(position.x - startRef.current.x);
    const h = Math.abs(position.y - startRef.current.y);

    if (w > 5 && h > 5) {
      setRects(previous => [...previous, { x, y, w, h }]);
    }

    setCurrentRect(null);
    setDrawing(false);
    startRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Annotate screenshot"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <FiEdit2 className="h-4 w-4 text-red-400" />
          <span className="text-sm font-semibold text-white">
            Draw rectangles to highlight areas of interest
          </span>
          <span className="hidden text-xs text-gray-400 sm:inline">
            - click and drag on the image
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setRects(previous => previous.slice(0, -1))}
            disabled={rects.length === 0}
            className="border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white disabled:border-white/10 disabled:bg-white/5 disabled:text-white/50"
            paddingStyles="px-3 py-1.5 text-xs"
            Icon={FiRotateCcw}
            showTextOnMobile
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            paddingStyles="px-3 py-1.5 text-xs"
            Icon={FiX}
            showTextOnMobile
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(rects)}
            className="text-xs"
            paddingStyles="px-3 py-1.5 text-xs"
            Icon={FiCheck}
            showTextOnMobile
          >
            Done
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        {!imageLoaded ? (
          <p className="text-sm text-gray-400">Loading screenshot...</p>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: 'crosshair',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 120px)',
              objectFit: 'contain',
              borderRadius: '6px',
              userSelect: 'none',
            }}
          />
        )}
      </div>

      <div className="shrink-0 py-2 text-center text-xs text-gray-400">
        {rects.length === 0
          ? 'No highlights yet - drag on the image to add one'
          : `${rects.length} highlight${rects.length > 1 ? 's' : ''} added`}
      </div>
    </div>
  );
};

export const FeedbackLauncher: React.FC = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [rating, setRating] = useState<number>(3);
  const [message, setMessage] = useState('');
  const [rawDataUrl, setRawDataUrl] = useState<string | null>(null);
  const [rawDimensions, setRawDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [rawScreenshotFile, setRawScreenshotFile] = useState<File | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(
    null
  );
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [annotatorOpen, setAnnotatorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const shouldHideLauncher = pathname.startsWith('/system/feedback');

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
    if (shouldHideLauncher && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, shouldHideLauncher]);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setIsUploadingScreenshot(false);
      setScreenshotFile(null);
      setScreenshotDataUrl(null);
      setRawDataUrl(null);
      setRawDimensions(null);
      setRawScreenshotFile(null);
      setAnnotatorOpen(false);
      setPreviewOpen(false);
      setIsCapturingScreenshot(false);
      return;
    }

    const nextDefaults = resetFormState();
    setCategory(nextDefaults.category);
    setRating(nextDefaults.rating);
    setMessage(nextDefaults.message);
    setScreenshotFile(null);
    setScreenshotDataUrl(null);
    setRawDataUrl(null);
    setRawDimensions(null);
    setRawScreenshotFile(null);
    setAnnotatorOpen(false);
    setPreviewOpen(false);
  }, [isOpen, user?.email]);

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewOpen]);

  const handleScreenshotUpload = async (file: File, successMessage: string) => {
    try {
      validateImageFile(file, {
        allowedMimeTypes: [...PROFILE_IMAGE_ALLOWED_MIME_TYPES],
        maxFileSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
      });

      const previewDataUrl = await readFileAsDataUrl(file);
      setScreenshotFile(file);
      setScreenshotDataUrl(previewDataUrl);
      setRawDataUrl(null);
      setRawDimensions(null);
      setRawScreenshotFile(null);
      setPreviewOpen(false);
      toast.info(successMessage);
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  const handleUploadImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectScreenshotImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    void handleScreenshotUpload(
      file,
      'Image attached. It will be uploaded when you send feedback.'
    );
  };

  const handleCaptureScreenshot = async () => {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      toast.error('Screenshot capture is not supported in this browser.');
      return;
    }

    setPreviewOpen(false);
    setIsCapturingScreenshot(true);

    await new Promise<void>(resolve => {
      window.setTimeout(resolve, 50);
    });

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false,
      } as DisplayMediaStreamOptions);

      const track = stream.getVideoTracks()[0];
      if (!track) {
        throw new Error('Failed to start screen capture.');
      }

      await new Promise<void>(resolve => {
        if (track.readyState === 'live') {
          resolve();
          return;
        }

        const timeoutId = window.setTimeout(resolve, 3000);
        track.addEventListener(
          'unmute',
          () => {
            window.clearTimeout(timeoutId);
            resolve();
          },
          { once: true }
        );
      });

      await new Promise<void>(resolve => {
        window.setTimeout(resolve, 500);
      });

      let capture:
        | {
            dataUrl: string;
            file: File;
            width: number;
            height: number;
          }
        | undefined;

      const ImageCaptureConstructor = (
        window as unknown as {
          ImageCapture?: new (track: MediaStreamTrack) => {
            grabFrame: () => Promise<ImageBitmap>;
          };
        }
      ).ImageCapture;

      if (ImageCaptureConstructor) {
        try {
          const imageCapture = new ImageCaptureConstructor(track);
          const bitmap = await imageCapture.grabFrame();
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;

          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Failed to prepare the screenshot canvas.');
          }

          context.drawImage(bitmap, 0, 0);
          capture = await canvasToScreenshotCapture(canvas);
        } catch (captureError) {
          console.warn(
            'ImageCapture failed, falling back to video capture:',
            captureError
          );
        }
      }

      if (!capture) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;

        await new Promise<void>(resolve => {
          video.onloadedmetadata = () => {
            void video.play().then(resolve).catch(resolve);
          };
          window.setTimeout(resolve, 1000);
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || window.innerWidth;
        canvas.height = video.videoHeight || window.innerHeight;

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to prepare the screenshot canvas.');
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        capture = await canvasToScreenshotCapture(canvas);
      }

      setRawDataUrl(capture.dataUrl);
      setRawDimensions({ width: capture.width, height: capture.height });
      setRawScreenshotFile(capture.file);
      setAnnotatorOpen(true);
    } catch (error) {
      if (!isCancelledCaptureError(error)) {
        toast.error(
          'Failed to capture screenshot',
          getUserFriendlyErrorMessage(error)
        );
      }
    } finally {
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturingScreenshot(false);
    }
  };

  const handleAnnotatorConfirm = async (rects: Rect[]) => {
    setAnnotatorOpen(false);

    if (!rawDataUrl || !rawDimensions || !rawScreenshotFile) {
      return;
    }

    try {
      if (rects.length === 0) {
        setScreenshotDataUrl(rawDataUrl);
        setScreenshotFile(rawScreenshotFile);
      } else {
        const flattened = await flattenAnnotations(
          rawDataUrl,
          rects,
          rawDimensions.width,
          rawDimensions.height
        );

        setScreenshotDataUrl(flattened.dataUrl);
        setScreenshotFile(flattened.file);
      }

      setRawDataUrl(null);
      setRawDimensions(null);
      setRawScreenshotFile(null);
      toast.success(
        'Screenshot attached',
        'Your screenshot is ready and will be uploaded when you send feedback.'
      );
    } catch (error) {
      toast.error(
        'Failed to process screenshot annotations',
        getUserFriendlyErrorMessage(error)
      );
    }
  };

  const handleAnnotatorCancel = () => {
    setAnnotatorOpen(false);
    setRawDataUrl(null);
    setRawDimensions(null);
    setRawScreenshotFile(null);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotDataUrl(null);
    setRawDataUrl(null);
    setRawDimensions(null);
    setRawScreenshotFile(null);
    setPreviewOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const trimmedEmail = String(user?.email || '').trim();
    const trimmedSubject = buildDefaultFeedbackSubject(category);
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error('Please describe your feedback before sending it.');
      return;
    }

    if (!trimmedEmail) {
      toast.error(
        'We could not find your account email. Please refresh and try again.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata = buildFeedbackMetadata(pathname);
      let screenshotUrl: string | undefined;

      if (screenshotFile) {
        setIsUploadingScreenshot(true);
        try {
          const uploadResult = await uploadToCloudinary(screenshotFile, {
            folder: 'feedback',
            tags: ['feedback', FEEDBACK_APP_NAME.toLowerCase()],
            allowedMimeTypes: [...PROFILE_IMAGE_ALLOWED_MIME_TYPES],
            maxFileSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
          });

          screenshotUrl = uploadResult.secure_url;
        } catch {
          toast.warning(
            'Screenshot upload failed',
            'Your feedback will still be submitted without the screenshot.'
          );
        } finally {
          setIsUploadingScreenshot(false);
        }
      }

      await feedbackService.submitFeedback({
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
        rating,
        category,
        app: FEEDBACK_APP_NAME,
        platform: 'web',
        screenshot_url: screenshotUrl,
        metadata,
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
      {isOpen && !isCapturingScreenshot && !annotatorOpen ? (
        <ReusableDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Share feedback"
          subtitle="Help us improve your experience. Tell us what's working well, what could be better, or any problems you've faced."
          size="xl"
          primaryAction={{
            label: isUploadingScreenshot
              ? 'Uploading screenshot...'
              : isSubmitting
                ? 'Sending...'
                : 'Send feedback',
            onClick: handleSubmit,
            loading: isSubmitting || isUploadingScreenshot,
            disabled:
              isSubmitting || isUploadingScreenshot || isCapturingScreenshot,
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setIsOpen(false),
            disabled:
              isSubmitting || isUploadingScreenshot || isCapturingScreenshot,
            variant: 'outlined',
          }}
        >
          <div className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={SCREENSHOT_ACCEPT}
              onChange={handleSelectScreenshotImage}
              className="hidden"
              disabled={
                isSubmitting || isUploadingScreenshot || isCapturingScreenshot
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Category"
                value={category}
                onChange={event =>
                  setCategory(
                    String(event.target.value || 'bug') as FeedbackCategory
                  )
                }
                required
                containerClassName="md:col-span-2"
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <TextInput
                label="Description"
                value={message}
                onChange={event => setMessage(String(event.target.value || ''))}
                placeholder="Describe what happened, what you expected, and any error details you saw."
                rows={6}
                required
                containerClassName="md:col-span-2"
              />

              <div className="space-y-3 md:col-span-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Screenshot
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A screenshot will help us better understand the issue.
                    Please don&apos;t include any sensitive information.
                  </p>
                </div>

                <div className="space-y-4 rounded-md border bg-muted/20 p-4">
                  {screenshotFile && screenshotDataUrl ? (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="group relative w-full overflow-hidden rounded-md border bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Preview screenshot"
                      >
                        <div className="relative h-32 w-full overflow-hidden">
                          <Image
                            src={screenshotDataUrl}
                            alt="Captured screenshot"
                            fill
                            unoptimized
                            className="object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100">
                            <FiZoomIn className="h-3.5 w-3.5" />
                            Preview
                          </span>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background/80 px-3 py-2 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <AqMonitor03 className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate font-medium text-foreground">
                            {screenshotFile.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            ({(screenshotFile.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <Button
                          variant="text"
                          onClick={handleRemoveScreenshot}
                          disabled={isSubmitting || isUploadingScreenshot}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          paddingStyles="px-2 py-1 text-xs"
                          Icon={AqTrash01}
                          showTextOnMobile
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outlined"
                          onClick={handleCaptureScreenshot}
                          disabled={isSubmitting || isUploadingScreenshot}
                          Icon={AqMonitor03}
                          showTextOnMobile
                        >
                          Retake screenshot
                        </Button>
                        <Button
                          variant="text"
                          onClick={handleUploadImageClick}
                          disabled={
                            isSubmitting ||
                            isUploadingScreenshot ||
                            isCapturingScreenshot
                          }
                          Icon={AqUploadCloud01}
                          showTextOnMobile
                        >
                          Upload image instead
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="outlined"
                        onClick={handleCaptureScreenshot}
                        disabled={isSubmitting || isUploadingScreenshot}
                        loading={isCapturingScreenshot}
                        fullWidth
                        Icon={AqMonitor03}
                        showTextOnMobile
                      >
                        Capture screenshot
                      </Button>

                      <div className="flex justify-center">
                        <Button
                          variant="text"
                          onClick={handleUploadImageClick}
                          disabled={
                            isSubmitting ||
                            isUploadingScreenshot ||
                            isCapturingScreenshot
                          }
                          Icon={AqUploadCloud01}
                          showTextOnMobile
                        >
                          Upload image instead
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP, or AVIF. Max 5MB. The image is uploaded only
                    when you send feedback.
                  </p>
                </div>
              </div>

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
      ) : null}

      {annotatorOpen && rawDataUrl ? (
        <ScreenshotAnnotator
          baseDataUrl={rawDataUrl}
          onConfirm={rects => {
            void handleAnnotatorConfirm(rects);
          }}
          onCancel={handleAnnotatorCancel}
        />
      ) : null}

      {previewOpen && screenshotDataUrl ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-md bg-black shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="relative h-[85vh] w-[85vw] min-w-[320px]">
              <Image
                src={screenshotDataUrl}
                alt="Screenshot preview"
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-3 top-3 bg-black/60 text-white hover:bg-black/80 hover:text-white"
              paddingStyles="p-2"
              Icon={FiX}
              aria-label="Close preview"
            />
          </div>
        </div>
      ) : null}
    </>
  );
};
