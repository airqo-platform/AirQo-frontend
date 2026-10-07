'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, Pencil, RotateCcw, X } from 'lucide-react';

import { HIGHLIGHT_FILL, HIGHLIGHT_STROKE, HighlightRect, loadImage } from './screenshot-tools';

interface ScreenshotAnnotatorProps {
  /** Raw (un-annotated) screenshot data URL */
  baseDataUrl: string;
  /** Highlight boxes in the image's natural pixels. */
  onConfirm: (rects: HighlightRect[]) => void;
  onCancel: () => void;
}

const toolbarButtonClass =
  'flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Full-screen editor for drawing highlight boxes on a screenshot. It is its
 * own Radix dialog so it stacks correctly over any dialog that is already open.
 * Pointer events cover mouse, touch and pen alike.
 */
export const ScreenshotAnnotator: React.FC<ScreenshotAnnotatorProps> = ({
  baseDataUrl,
  onConfirm,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [rects, setRects] = useState<HighlightRect[]>([]);
  const [current, setCurrent] = useState<HighlightRect | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setImgLoaded(false);
    loadImage(baseDataUrl)
      .then((img) => {
        if (cancelled) return;
        imgRef.current = img;
        setImgLoaded(true);
      })
      .catch(() => {
        if (!cancelled) onCancel();
      });
    return () => {
      cancelled = true;
    };
  }, [baseDataUrl, onCancel]);

  // The canvas works in the image's natural pixels and is scaled down by CSS.
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.lineWidth = Math.max(2, canvas.width / 500);
    for (const r of current ? [...rects, current] : rects) {
      ctx.fillStyle = HIGHLIGHT_FILL;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = HIGHLIGHT_STROKE;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
  }, [current, imgLoaded, rects]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - bounds.left) * canvas.width) / bounds.width,
      y: ((e.clientY - bounds.top) * canvas.height) / bounds.height,
    };
  };

  const rectFrom = (pos: { x: number; y: number }): HighlightRect => {
    const start = startRef.current!;
    return {
      x: Math.min(pos.x, start.x),
      y: Math.min(pos.y, start.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    startRef.current = pos;
    setCurrent({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!startRef.current) return;
    setCurrent(rectFrom(getPos(e)));
  };

  const finishRect = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!startRef.current) return;
    const rect = rectFrom(getPos(e));
    // Ignore taps and accidental clicks; the threshold is in on-screen pixels.
    const scale = canvasRef.current!.width / canvasRef.current!.getBoundingClientRect().width;
    if (rect.w > 5 * scale && rect.h > 5 * scale) {
      setRects((prev) => [...prev, rect]);
    }
    setCurrent(null);
    startRef.current = null;
  };

  const handleUndo = useCallback(() => setRects((prev) => prev.slice(0, -1)), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onCancel()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed inset-0 z-[10000] flex flex-col focus:outline-none"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-red-400" aria-hidden="true" />
              <DialogPrimitive.Title className="text-sm font-semibold text-white">
                Draw boxes to highlight areas of interest
              </DialogPrimitive.Title>
              <span className="ml-1 hidden text-xs text-gray-400 sm:inline">
                — drag on the image
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={rects.length === 0}
                className={toolbarButtonClass}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
              </button>
              <button type="button" onClick={onCancel} className={toolbarButtonClass}>
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(rects)}
                disabled={!imgLoaded}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                Done
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-auto p-4">
            {imgLoaded ? (
              <canvas
                ref={canvasRef}
                aria-label="Screenshot — drag to draw a highlight box"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finishRect}
                onPointerCancel={finishRect}
                className="max-h-[calc(100vh-120px)] max-w-full cursor-crosshair touch-none select-none rounded-lg object-contain"
              />
            ) : (
              <p className="text-sm text-gray-400">Loading screenshot…</p>
            )}
          </div>

          <div className="shrink-0 py-2 text-center text-xs text-gray-400" aria-live="polite">
            {rects.length === 0
              ? 'No highlights yet — drag on the image to add one'
              : `${rects.length} highlight${rects.length > 1 ? 's' : ''} added`}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

interface ScreenshotPreviewProps {
  src: string;
  onClose: () => void;
}

/** Full-size view of the attached screenshot. Escape or a click outside closes it. */
export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({ src, onClose }) => (
  <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm" />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className="fixed left-1/2 top-1/2 z-[10000] max-h-[90vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl shadow-2xl focus:outline-none"
      >
        <DialogPrimitive.Title className="sr-only">Screenshot preview</DialogPrimitive.Title>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Screenshot preview"
          className="block max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
        />
        <DialogPrimitive.Close
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
