"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_FEEDBACK_KEY_PREFIX,
  createFeedbackPreferences,
} from "./feedback-preferences";
import {
  SatisfactionFeedbackToast,
  SatisfactionToastDismissReason,
} from "./satisfaction-feedback-toast";
import type { LoginFeedbackSubmission } from "./types";

/*
 * Copied from beacon/components/features/feedback/login-feedback-toast.tsx.
 * vertex/components/features/feedback/login-feedback-toast.tsx is the same
 * popup; Vertex already takes `userId` and `email` as props, Beacon read them
 * from next-auth. Behaviour differs: Vertex asks on any page load until the
 * person has a record (not only right after signing in), reads the start time
 * from sessionStorage `vertex_login_start_ts`, and sends no `landingPage`.
 * Nexus has none.
 *
 * Replaced app state:
 * - next-auth's session → `personId`, `email` and `isAuthenticated`.
 * - feedbackService.submitLoginFeedback → `onSubmit`.
 * - lib/feedback-preferences → `storageKeyPrefix` ("beacon" by default). The
 *   app's login page calls `createFeedbackPreferences(prefix).markLoginStarted()`
 *   when the sign-in is submitted; without it the toast never shows.
 */

const LOGIN_NEGATIVE_REASONS = [
  "It took too long to load",
  "I had trouble with my password",
  "I got an error message",
  "The page froze or crashed",
  "Other",
];

interface LoginFeedbackToastProps {
  /** Stable id for the signed-in person (Beacon: session user `_id`, else email). */
  personId: string;
  /** Email sent with the feedback (Beacon: session email, else userName). */
  email: string;
  /** True once the session has loaded and is signed in. */
  isAuthenticated: boolean;
  /** Sends the feedback; throwing makes the toast say so instead of thanking them. */
  onSubmit: (feedback: LoginFeedbackSubmission) => Promise<void>;
  /** Prefix of the storage keys; must match the one the login page uses. */
  storageKeyPrefix?: string;
  subtitle?: string;
  thankYouMessage?: string;
}

/**
 * Asks how signing in went, once per sign-in and at most once per cooldown for
 * each person. Only shown right after a sign-in; reloading the dashboard later
 * does not bring it back.
 */
const LoginFeedbackToast: React.FC<LoginFeedbackToastProps> = ({
  personId,
  email,
  isAuthenticated,
  onSubmit,
  storageKeyPrefix = DEFAULT_FEEDBACK_KEY_PREFIX,
  subtitle = "Rate us to help improve Beacon",
  thankYouMessage,
}) => {
  const pathname = usePathname();
  const preferences = useMemo(
    () => createFeedbackPreferences(storageKeyPrefix),
    [storageKeyPrefix]
  );

  const [shouldAskForFeedback, setShouldAskForFeedback] = useState(false);
  const loginDurationRef = useRef(0);
  const landingPageRef = useRef("");

  useEffect(() => {
    if (!isAuthenticated || !personId) return;

    const loginStartedAt = preferences.consumeLoginStartedAt();
    if (!loginStartedAt) return;
    if (preferences.getLoginFeedbackRecord(personId)) return;

    loginDurationRef.current = Date.now() - loginStartedAt;
    landingPageRef.current = window.location.pathname;
    setShouldAskForFeedback(true);
    // Only the sign-in itself matters here; later navigation must not re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId, isAuthenticated]);

  const submitLoginFeedback = async (rating: number, description?: string) => {
    // Throwing lets the toast say so instead of thanking them for nothing.
    if (!email) throw new Error("No email address on this session");
    await onSubmit({
      email,
      rating,
      description,
      loginDurationMs: loginDurationRef.current,
      landingPage: landingPageRef.current || pathname || "",
      submittedAt: Date.now(),
    });
    preferences.setLoginFeedbackRecord(personId);
  };

  const handleDismiss = useCallback(
    (reason: SatisfactionToastDismissReason) => {
      // Closing the popup is a deliberate "not now", so respect it for the same
      // cooldown a rating earns. The auto-hide is not a decision: we may ask
      // again on the next sign-in.
      if (reason === "close") {
        preferences.setLoginFeedbackRecord(personId);
      }
      setShouldAskForFeedback(false);
    },
    [personId, preferences]
  );

  return (
    <SatisfactionFeedbackToast
      enabled={shouldAskForFeedback}
      resetKey={personId}
      promptSlotId="login-experience"
      title="How was your login experience?"
      subtitle={subtitle}
      thankYouMessage={thankYouMessage}
      negativeReasons={LOGIN_NEGATIVE_REASONS}
      onPositiveSubmit={() => submitLoginFeedback(5)}
      onNegativeSubmit={(description) => submitLoginFeedback(1, description)}
      onDismiss={handleDismiss}
    />
  );
};

export default LoginFeedbackToast;
