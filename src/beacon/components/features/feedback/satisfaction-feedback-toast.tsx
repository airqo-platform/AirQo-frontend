"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { AqXClose } from "@airqo/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  claimFeedbackPromptSlot,
  releaseFeedbackPromptSlot,
} from "./feedback-prompt-slot";

type ToastPhase =
  | "idle"
  | "visible"
  | "negative-expanded"
  | "submitting"
  | "thankyou"
  | "dismissed";

/**
 * Why the toast went away. Only "close" is the person saying "don't ask me" —
 * the auto-hide is not a decision, so callers may ask again next time.
 */
export type SatisfactionToastDismissReason = "auto" | "close" | "submitted";

interface SatisfactionFeedbackToastProps {
  title: string;
  subtitle?: string;
  negativeReasons: string[];
  onPositiveSubmit: () => Promise<void> | void;
  onNegativeSubmit: (description?: string) => Promise<void> | void;
  enabled?: boolean;
  resetKey?: string | number;
  positiveLabel?: string;
  negativeLabel?: string;
  otherReasonLabel?: string;
  otherPlaceholder?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  showDelayMs?: number;
  autoDismissMs?: number;
  onDismiss?: (reason: SatisfactionToastDismissReason) => void;
  /**
   * Claims the single on-screen prompt slot while this toast is showing, so
   * other satisfaction prompts stay out of the way.
   */
  promptSlotId?: string;
  className?: string;
}

export const SatisfactionFeedbackToast: React.FC<SatisfactionFeedbackToastProps> = ({
  title,
  subtitle = "Rate us to help improve Beacon",
  negativeReasons,
  onPositiveSubmit,
  onNegativeSubmit,
  enabled = true,
  resetKey,
  positiveLabel = "Great",
  negativeLabel = "Not great",
  otherReasonLabel = "Other",
  otherPlaceholder = "Please provide details (required)",
  thankYouTitle = "Thank you for your feedback!",
  thankYouMessage = "Your input helps us improve Beacon.",
  showDelayMs = 3000,
  autoDismissMs = 30000,
  onDismiss,
  promptSlotId,
  // Above Leaflet's map controls (z-index 1000), below dialogs.
  className = "fixed bottom-6 right-6 z-[1100] w-80 max-w-[calc(100vw-3rem)]",
}) => {
  const [phase, setPhase] = useState<ToastPhase>("idle");
  const [description, setDescription] = useState("");
  const [otherText, setOtherText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const dismissNotifiedRef = useRef(false);
  const dismissReasonRef = useRef<SatisfactionToastDismissReason>("auto");
  const autoHideRemainingRef = useRef(autoDismissMs);
  const thankYouTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover and focus are tracked apart: losing one must not resume the countdown
  // while the other still has hold of the toast.
  const isAutoHidePaused = isHovered || hasFocusInside;

  useEffect(() => {
    dismissNotifiedRef.current = false;
    dismissReasonRef.current = "auto";
    autoHideRemainingRef.current = autoDismissMs;
    setDescription("");
    setOtherText("");
    setIsHovered(false);
    setHasFocusInside(false);
    setPhase("idle");

    if (!enabled) return;

    const showTimer = setTimeout(() => {
      setPhase((current) => (current === "idle" ? "visible" : current));
    }, showDelayMs);

    return () => {
      clearTimeout(showTimer);
    };
  }, [autoDismissMs, enabled, resetKey, showDelayMs]);

  useEffect(
    () => () => {
      if (thankYouTimerRef.current) clearTimeout(thankYouTimerRef.current);
    },
    []
  );

  // The auto-hide only counts down while the toast is sitting there untouched:
  // it pauses on hover and on focus so nobody loses a half-typed reason, and it
  // does not run at all once the reason list is open.
  useEffect(() => {
    if (phase !== "visible" || isAutoHidePaused) return;

    const startedAt = Date.now();
    const autoHideTimer = setTimeout(() => {
      dismissReasonRef.current = "auto";
      setPhase("dismissed");
    }, autoHideRemainingRef.current);

    return () => {
      clearTimeout(autoHideTimer);
      autoHideRemainingRef.current = Math.max(
        0,
        autoHideRemainingRef.current - (Date.now() - startedAt)
      );
    };
  }, [isAutoHidePaused, phase]);

  const handleClose = useCallback(() => {
    dismissReasonRef.current = "close";
    setPhase("dismissed");
  }, []);

  // Escape closes the popup, same as the ✕.
  useEffect(() => {
    if (phase !== "visible" && phase !== "negative-expanded") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // A dialog on top owns Escape.
      if (event.key === "Escape" && !document.querySelector('[role="dialog"][data-state="open"]')) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, phase]);

  useEffect(() => {
    if (phase !== "dismissed" || dismissNotifiedRef.current) return;
    dismissNotifiedRef.current = true;
    onDismiss?.(dismissReasonRef.current);
  }, [onDismiss, phase]);

  const isShowing = phase !== "idle" && phase !== "dismissed";

  useEffect(() => {
    if (!promptSlotId || !isShowing) return;
    claimFeedbackPromptSlot(promptSlotId);
    return () => {
      releaseFeedbackPromptSlot(promptSlotId);
    };
  }, [isShowing, promptSlotId]);

  const showThankYouAndDismiss = () => {
    setPhase("thankyou");
    thankYouTimerRef.current = setTimeout(() => {
      dismissReasonRef.current = "submitted";
      setPhase("dismissed");
    }, 2000);
  };

  const handlePositive = async () => {
    setPhase("submitting");
    try {
      await onPositiveSubmit();
    } catch (error) {
      console.error("Failed to submit positive satisfaction feedback", error);
    }
    showThankYouAndDismiss();
  };

  const handleNegativeSubmit = async () => {
    setPhase("submitting");
    try {
      const finalDescription =
        description === otherReasonLabel
          ? `${otherReasonLabel}: ${otherText.trim()}`
          : description.trim() || undefined;

      await onNegativeSubmit(finalDescription);
    } catch (error) {
      console.error("Failed to submit negative satisfaction feedback", error);
    }
    showThankYouAndDismiss();
  };

  const isOtherReason = description === otherReasonLabel;
  const isSubmitting = phase === "submitting";
  const isSubmitDisabled =
    isSubmitting || !description || (isOtherReason && !otherText.trim());

  if (!isShowing) return null;

  return (
    <div
      className={cn("animate-in fade-in slide-in-from-bottom-6 duration-300", className)}
      role="dialog"
      aria-label={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocusInside(true)}
      onBlur={(event) => {
        // React's onBlur is focusout, so it also fires when focus just moves
        // between two controls inside the toast.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusInside(false);
        }
      }}
    >
      <Card className="rounded-2xl shadow-lg overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          {phase === "thankyou" ? (
            <div className="flex flex-col items-center justify-center py-4 text-center" aria-live="polite">
              <span className="text-xl mb-2" aria-hidden="true">🎉</span>
              <p className="text-sm font-medium text-foreground">{thankYouTitle}</p>
              {thankYouMessage && (
                <p className="text-xs text-muted-foreground mt-1">{thankYouMessage}</p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground leading-tight mb-1">
                    {title}
                  </h4>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 -mt-1 -mr-1 text-muted-foreground"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  aria-label="Close"
                >
                  <AqXClose className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  className="flex-1"
                  onClick={handlePositive}
                  disabled={phase === "submitting" || phase === "negative-expanded"}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {positiveLabel}
                </Button>
                <Button
                  variant="outline"
                  className={cn("flex-1", phase === "negative-expanded" && "bg-muted opacity-50")}
                  onClick={() => {
                    if (phase === "visible") setPhase("negative-expanded");
                  }}
                  disabled={phase === "submitting"}
                  aria-expanded={phase === "negative-expanded"}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {negativeLabel}
                </Button>
              </div>

              {(phase === "negative-expanded" || (isSubmitting && description)) && (
                <div className="pt-3 border-t border-border mt-1 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <RadioGroup
                    value={description}
                    onValueChange={(reason) => {
                      setDescription(reason);
                      if (reason !== otherReasonLabel) setOtherText("");
                    }}
                    disabled={isSubmitting}
                    aria-label="What went wrong?"
                    className="gap-2 mb-1"
                  >
                    {negativeReasons.map((reason, index) => (
                      <div key={reason} className="flex items-center gap-2">
                        <RadioGroupItem value={reason} id={`satisfaction-reason-${index}`} />
                        <Label
                          htmlFor={`satisfaction-reason-${index}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {reason}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {isOtherReason && (
                    <Textarea
                      placeholder={otherPlaceholder}
                      aria-label={otherPlaceholder}
                      className="resize-none min-h-[70px] mt-1 animate-in fade-in duration-200"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  )}
                  <Button
                    className="w-full mt-1"
                    onClick={handleNegativeSubmit}
                    disabled={isSubmitDisabled}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Submit
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
