"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { feedbackService } from "@/core/apis/feedback";
import {
  getLoginFeedbackRecord,
  setLoginFeedbackRecord,
} from "@/core/utils/userPreferences";
import {
  ReusableSatisfactionFeedbackToast,
  SatisfactionToastDismissReason,
} from "./reusable-satisfaction-feedback-toast";

const LOGIN_NEGATIVE_REASONS = [
  "It took too long to load",
  "I had trouble with my password",
  "I got an error message",
  "The page froze or crashed",
  "Other",
];

interface LoginFeedbackToastProps {
  userId: string;
  email: string;
}

const LoginFeedbackToast: React.FC<LoginFeedbackToastProps> = ({
  userId,
  email,
}) => {
  const [shouldAskForFeedback, setShouldAskForFeedback] = useState(false);
  const loginDurationRef = useRef(0);

  useEffect(() => {
    if (!userId) {
      setShouldAskForFeedback(false);
      return;
    }

    const record = getLoginFeedbackRecord(userId);
    if (record && Date.now() < record.expiresAt) {
      setShouldAskForFeedback(false);
      return;
    }

    const loginStartTs = Number(
      sessionStorage.getItem("vertex_login_start_ts") || 0
    );
    loginDurationRef.current =
      loginStartTs > 0 ? Date.now() - loginStartTs : 0;
    setShouldAskForFeedback(true);
  }, [userId]);

  const submitLoginFeedback = async (rating: number, description?: string) => {
    await feedbackService.submitLoginFeedback({
      email,
      rating,
      description,
      loginDurationMs: loginDurationRef.current,
      submittedAt: Date.now(),
    });
    setLoginFeedbackRecord(userId);
  };

  const handleDismiss = useCallback(
    (reason: SatisfactionToastDismissReason) => {
      // Closing the popup is a deliberate "not now", so respect it for the same
      // cooldown a rating earns. The auto-hide is not a decision: we may ask
      // again on the next login.
      if (reason === "close") {
        setLoginFeedbackRecord(userId);
      }
      setShouldAskForFeedback(false);
    },
    [userId]
  );

  return (
    <ReusableSatisfactionFeedbackToast
      enabled={shouldAskForFeedback}
      resetKey={userId}
      promptSlotId="login-experience"
      title="How was your login experience?"
      subtitle="Rate us to help improve Vertex"
      negativeReasons={LOGIN_NEGATIVE_REASONS}
      onPositiveSubmit={() => submitLoginFeedback(5)}
      onNegativeSubmit={(description) => submitLoginFeedback(1, description)}
      onDismiss={handleDismiss}
    />
  );
};

export default LoginFeedbackToast;
