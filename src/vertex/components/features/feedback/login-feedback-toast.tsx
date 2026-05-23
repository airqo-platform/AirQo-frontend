"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { feedbackService } from "@/core/apis/feedback";
import { getLoginFeedbackRecord, setLoginFeedbackRecord } from "@/core/utils/userPreferences";
import { openFeedbackDialog } from "./feedback-dialog";

type ToastPhase = "idle" | "visible" | "negative-expanded" | "submitting" | "thankyou" | "dismissed";

interface LoginFeedbackToastProps {
  userId: string;
  email: string;
}

const LoginFeedbackToast: React.FC<LoginFeedbackToastProps> = ({ userId, email }) => {
  const [phase, setPhase] = useState<ToastPhase>("idle");
  const [description, setDescription] = useState("");
  const loginDurationRef = useRef(0);

  useEffect(() => {
    if (!userId) return;

    // Check if we should suppress the prompt
    const record = getLoginFeedbackRecord(userId);
    if (record && Date.now() < record.expiresAt) return; // Stay idle

    // Compute login duration
    const loginStartTs = Number(sessionStorage.getItem("vertex_login_start_ts") || 0);
    loginDurationRef.current = loginStartTs > 0 ? Date.now() - loginStartTs : 0;

    // Show after 3 seconds
    const showTimer = setTimeout(() => {
      setPhase((current) => (current === "idle" ? "visible" : current));
    }, 3000);

    // Auto-dismiss after 10 minutes (3s wait + 10m visibility)
    // Only dismiss if the user hasn't interacted (still in "visible" phase)
    const autoTimer = setTimeout(() => {
      setPhase((current) => (current === "visible" ? "dismissed" : current));
    }, 603000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoTimer);
    };
  }, [userId]);

  const handlePositive = async () => {
    setPhase("submitting");
    try {
      await feedbackService.submitLoginFeedback({
        email,
        rating: 5,
        loginDurationMs: loginDurationRef.current,
        submittedAt: Date.now(),
      });
      setLoginFeedbackRecord(userId);
    } catch (error) {
      console.error("Failed to submit positive login feedback", error);
      // Swallow error, skip localStorage write
    }
    showThankYouAndDismiss();
  };

  const handleNegativeSubmit = async () => {
    setPhase("submitting");
    try {
      await feedbackService.submitLoginFeedback({
        email,
        rating: 1,
        description: description.trim() || undefined,
        loginDurationMs: loginDurationRef.current,
        submittedAt: Date.now(),
      });
      setLoginFeedbackRecord(userId);
    } catch (error) {
      console.error("Failed to submit negative login feedback", error);
      // Swallow error
    }
    showThankYouAndDismiss();
  };

  const handleNegativeAddDetails = () => {
    // Open the comprehensive feedback dialog and dismiss this toast silently
    openFeedbackDialog();
    setPhase("dismissed");
  };

  const showThankYouAndDismiss = () => {
    setPhase("thankyou");
    setTimeout(() => {
      setPhase("dismissed");
    }, 2000);
  };

  if (phase === "idle" || phase === "dismissed") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="login-feedback-toast"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-[9999] w-80"
      >
        <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="p-5 flex flex-col gap-4">
            {phase === "thankyou" ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <span className="text-xl mb-2">🎉</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Thank you for your feedback!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your input helps us improve Vertex.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">
                    How was your login experience?
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rate us to help improve Vertex
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <ReusableButton
                    variant="filled"
                    className="flex-1 py-2"
                    onClick={handlePositive}
                    disabled={phase === "submitting" || phase === "negative-expanded"}
                    Icon={ThumbsUp}
                  >
                    Great
                  </ReusableButton>
                  <ReusableButton
                    variant="outlined"
                    className={`flex-1 py-2 ${
                      phase === "negative-expanded" ? "bg-gray-100 dark:bg-gray-700 opacity-50" : ""
                    }`}
                    onClick={() => {
                      if (phase === "visible") setPhase("negative-expanded");
                    }}
                    disabled={phase === "submitting"}
                    Icon={ThumbsDown}
                  >
                    Not great
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
                        <textarea
                          placeholder="Tell us more (optional)"
                          className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[70px]"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={phase === "submitting"}
                        />
                        <div className="flex gap-2">
                          <ReusableButton
                            variant="filled"
                            className="flex-1 py-2"
                            onClick={handleNegativeSubmit}
                            loading={phase === "submitting"}
                            disabled={phase === "submitting"}
                          >
                            Submit
                          </ReusableButton>
                          <ReusableButton
                            variant="outlined"
                            className="flex-1 py-2"
                            onClick={handleNegativeAddDetails}
                            disabled={phase === "submitting"}
                          >
                            Add Details
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

export default LoginFeedbackToast;
