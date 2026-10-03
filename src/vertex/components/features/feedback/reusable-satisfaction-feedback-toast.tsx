"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { AqXClose } from "@airqo/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
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
 * Why the toast went away. Only "close" is the user saying "don't ask me" —
 * the auto-hide is not a decision, so callers may ask again next time.
 */
export type SatisfactionToastDismissReason = "auto" | "close" | "submitted";

interface ReusableSatisfactionFeedbackToastProps {
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

export const ReusableSatisfactionFeedbackToast: React.FC<
  ReusableSatisfactionFeedbackToastProps
> = ({
  title,
  subtitle = "Rate us to help improve Vertex",
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
  thankYouMessage = "Your input helps us improve Vertex.",
  showDelayMs = 3000,
  autoDismissMs = 30000,
  onDismiss,
  promptSlotId,
  className = "fixed bottom-6 right-6 z-[9999] w-80",
}) => {
  const [phase, setPhase] = useState<ToastPhase>("idle");
  const [description, setDescription] = useState("");
  const [otherText, setOtherText] = useState("");
  const [isAutoHidePaused, setIsAutoHidePaused] = useState(false);
  const dismissNotifiedRef = useRef(false);
  const dismissReasonRef = useRef<SatisfactionToastDismissReason>("auto");
  const autoHideRemainingRef = useRef(autoDismissMs);

  useEffect(() => {
    dismissNotifiedRef.current = false;
    dismissReasonRef.current = "auto";
    autoHideRemainingRef.current = autoDismissMs;
    setDescription("");
    setOtherText("");
    setIsAutoHidePaused(false);
    setPhase("idle");

    if (!enabled) return;

    const showTimer = setTimeout(() => {
      setPhase((current) => (current === "idle" ? "visible" : current));
    }, showDelayMs);

    return () => {
      clearTimeout(showTimer);
    };
  }, [autoDismissMs, enabled, resetKey, showDelayMs]);

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
      if (event.key === "Escape") handleClose();
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
    setTimeout(() => {
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
    isSubmitting ||
    !description ||
    (isOtherReason && !otherText.trim());

  if (!isShowing) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="reusable-satisfaction-feedback-toast"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={className}
        role="dialog"
        aria-label={title}
        onMouseEnter={() => setIsAutoHidePaused(true)}
        onMouseLeave={() => setIsAutoHidePaused(false)}
        onFocus={() => setIsAutoHidePaused(true)}
        onBlur={() => setIsAutoHidePaused(false)}
      >
        <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="p-5 flex flex-col gap-4">
            {phase === "thankyou" ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <span className="text-xl mb-2">🎉</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {thankYouTitle}
                </p>
                {thankYouMessage && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {thankYouMessage}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">
                      {title}
                    </h4>
                    {subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <ReusableButton
                    variant="text"
                    padding="p-0"
                    className="h-7 w-7 shrink-0 -mt-1 -mr-1 text-gray-500 dark:text-gray-400"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    Icon={AqXClose}
                    aria-label="Close"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <ReusableButton
                    variant="filled"
                    className="flex-1 py-2"
                    onClick={handlePositive}
                    disabled={
                      phase === "submitting" || phase === "negative-expanded"
                    }
                    Icon={ThumbsUp}
                  >
                    {positiveLabel}
                  </ReusableButton>
                  <ReusableButton
                    variant="outlined"
                    className={`flex-1 py-2 ${
                      phase === "negative-expanded"
                        ? "bg-gray-100 dark:bg-gray-700 opacity-50"
                        : ""
                    }`}
                    onClick={() => {
                      if (phase === "visible") setPhase("negative-expanded");
                    }}
                    disabled={phase === "submitting"}
                    Icon={ThumbsDown}
                  >
                    {negativeLabel}
                  </ReusableButton>
                </div>

                <AnimatePresence>
                  {phase === "negative-expanded" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-1 flex flex-col gap-3">
                        <div className="space-y-2 mb-1">
                          {negativeReasons.map((reason) => (
                            <label
                              key={reason}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="reason"
                                value={reason}
                                checked={description === reason}
                                onChange={() => {
                                  setDescription(reason);
                                  if (reason !== otherReasonLabel) {
                                    setOtherText("");
                                  }
                                }}
                                disabled={isSubmitting}
                                className="h-4 w-4 text-primary accent-primary"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {reason}
                              </span>
                            </label>
                          ))}
                        </div>
                        <AnimatePresence>
                          {isOtherReason && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <ReusableInputField
                                as="textarea"
                                placeholder={otherPlaceholder}
                                className="resize-none min-h-[70px] mt-1"
                                value={otherText}
                                onChange={(e) => setOtherText(e.target.value)}
                                disabled={isSubmitting}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="flex gap-2 mt-1">
                          <ReusableButton
                            variant="filled"
                            className="w-full py-2"
                            onClick={handleNegativeSubmit}
                            loading={isSubmitting}
                            disabled={isSubmitDisabled}
                          >
                            Submit
                          </ReusableButton>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
