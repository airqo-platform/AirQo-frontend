"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { feedbackService } from "@/services/feedback.service";
import {
  consumeLoginStartedAt,
  getLoginFeedbackRecord,
  setLoginFeedbackRecord,
} from "@/lib/feedback-preferences";
import {
  SatisfactionFeedbackToast,
  SatisfactionToastDismissReason,
} from "./satisfaction-feedback-toast";

const LOGIN_NEGATIVE_REASONS = [
  "It took too long to load",
  "I had trouble with my password",
  "I got an error message",
  "The page froze or crashed",
  "Other",
];

/**
 * Asks how signing in went, once per sign-in and at most once per cooldown for
 * each person. Only shown right after a sign-in; reloading the dashboard later
 * does not bring it back.
 */
const LoginFeedbackToast: React.FC = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const personId = session?.user?._id || session?.user?.email || "";
  const email = session?.user?.email || session?.user?.userName || "";

  const [shouldAskForFeedback, setShouldAskForFeedback] = useState(false);
  const loginDurationRef = useRef(0);
  const landingPageRef = useRef("");

  useEffect(() => {
    if (status !== "authenticated" || !personId) return;

    const loginStartedAt = consumeLoginStartedAt();
    if (!loginStartedAt) return;
    if (getLoginFeedbackRecord(personId)) return;

    loginDurationRef.current = Date.now() - loginStartedAt;
    landingPageRef.current = window.location.pathname;
    setShouldAskForFeedback(true);
    // Only the sign-in itself matters here; later navigation must not re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId, status]);

  const submitLoginFeedback = async (rating: number, description?: string) => {
    if (!email) return;
    await feedbackService.submitLoginFeedback({
      email,
      rating,
      description,
      loginDurationMs: loginDurationRef.current,
      landingPage: landingPageRef.current || pathname || "",
      submittedAt: Date.now(),
    });
    setLoginFeedbackRecord(personId);
  };

  const handleDismiss = useCallback(
    (reason: SatisfactionToastDismissReason) => {
      // Closing the popup is a deliberate "not now", so respect it for the same
      // cooldown a rating earns. The auto-hide is not a decision: we may ask
      // again on the next sign-in.
      if (reason === "close") {
        setLoginFeedbackRecord(personId);
      }
      setShouldAskForFeedback(false);
    },
    [personId]
  );

  return (
    <SatisfactionFeedbackToast
      enabled={shouldAskForFeedback}
      resetKey={personId}
      promptSlotId="login-experience"
      title="How was your login experience?"
      subtitle="Rate us to help improve Beacon"
      negativeReasons={LOGIN_NEGATIVE_REASONS}
      onPositiveSubmit={() => submitLoginFeedback(5)}
      onNegativeSubmit={(description) => submitLoginFeedback(1, description)}
      onDismiss={handleDismiss}
    />
  );
};

export default LoginFeedbackToast;
