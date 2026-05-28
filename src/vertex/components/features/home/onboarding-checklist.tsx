"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChecklistStep = {
  id: string;
  title: string;
  description: string;
  cta: string;
  heuristic: string;
};

type OnboardingChecklistProps = {
  onAddDevice: () => void;
  // onClaimDevice: () => void;
  // onImportDevice: () => void;
  onGoToCohorts: () => void;
  completedSteps: string[];
  onDismiss: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: ChecklistStep[] = [
  {
    id: "add-device",
    title: "Add your first device",
    description:
      "Claim an AirQo sensor or add a device from a different sensor manufacturer (Clarity, PurpleAir, and others).",
    cta: "Add a device",
    heuristic: "Start here",
  },
  {
    id: "assign-cohort",
    title: "Group your devices",
    description:
      "Organise your devices into groups so you can manage them together.",
    cta: "Create a group",
    heuristic: "Step 2",
  },
  {
    id: "set-visibility",
    title: "Share your data",
    description:
      "Choose who can see your device data — keep it private or make it public. You can change this any time.",
    cta: "Set sharing",
    heuristic: "Step 3",
  },
];

// ─── useLocalStorage hook ─────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn("localStorage write failed:", error);
    }
  };

  return [storedValue, setValue] as const;
}

// ─── StepRow ──────────────────────────────────────────────────────────────────

type StepRowProps = {
  step: ChecklistStep;
  isComplete: boolean;
  isLocked: boolean;
  onAction: () => void;
};

const StepRow: React.FC<StepRowProps> = ({
  step,
  isComplete,
  isLocked,
  onAction,
}) => {
  // Active = current actionable step (not done, not locked)
  const isActive = !isComplete && !isLocked;

  return (
    <div
      className={cn(
        "flex items-start gap-4 py-4 px-2 rounded-lg transition-colors duration-200",
        // Active step gets a subtle blue tint to draw attention
        isActive && "bg-blue-50/40 dark:bg-blue-950/20",
      )}
    >
      {/* Status icon — H1: Visibility of system status */}
      <div className="mt-0.5 shrink-0">
        {isComplete ? (
          <CheckCircle2
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            aria-label="Completed"
          />
        ) : (
          <Circle
            className={cn(
              "h-5 w-5",
              isActive
                ? "text-blue-500 dark:text-blue-400"   // active: primary colour
                : "text-gray-300 dark:text-gray-600",   // upcoming: muted, not disabled
            )}
            aria-label="Not yet completed"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {/* Badge — H6: Recognition over recall, makes sequence obvious */}
          <span
            className={cn(
              "text-[11px] font-medium px-1.5 py-0.5 rounded",
              isComplete
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
                : isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  // upcoming: same readable gray as active description — not washed out
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
            )}
          >
            {isComplete ? "Done" : step.heuristic}
          </span>

          <p
            className={cn(
              "text-sm font-medium",
              isComplete
                ? "line-through text-gray-400 dark:text-gray-500"
                // upcoming title: same weight and colour as active — icon is the only differentiator
                : "text-gray-900 dark:text-gray-100",
            )}
          >
            {step.title}
          </p>
        </div>

        {/* Description — visible for all incomplete steps so user knows what's coming */}
        {!isComplete && (
          <p
            className={cn(
              "text-sm leading-relaxed",
              // same description colour regardless of locked/active — text is always readable
              "text-gray-500 dark:text-gray-400",
            )}
          >
            {step.description}
          </p>
        )}
      </div>

      {/* CTA — only on the active step */}
      {isActive && (
        <button
          onClick={onAction}
          className={cn(
            "shrink-0 flex items-center gap-1.5 text-sm font-medium mt-0.5",
            "text-blue-600 dark:text-blue-400",
            "hover:text-blue-700 dark:hover:text-blue-300",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded",
          )}
          aria-label={`${step.cta} — ${step.title}`}
        >
          {step.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// ─── ProgressBar ──────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Setup progress: ${completed} of ${total} steps complete`}
      >
        <div
          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
        {completed}/{total} done
      </span>
    </div>
  );
};

// ─── OnboardingChecklist ──────────────────────────────────────────────────────

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  onAddDevice,
  // onClaimDevice,
  // onImportDevice,
  onGoToCohorts,
  completedSteps,
  onDismiss,
}) => {
  // H3: User control and freedom — collapsible, persisted across page loads
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "vertex_onboarding_collapsed",
    false,
  );

  const completedCount = completedSteps.length;
  const allComplete = completedCount === STEPS.length;

  // Map each step ID to its action handler
  const stepActions: Record<string, () => void> = {
    "add-device": onAddDevice,
    "assign-cohort": onGoToCohorts,
    "set-visibility": onGoToCohorts,
  };

  // A step is locked (upcoming) only if the previous step isn't done yet.
  // Locked steps are visible and readable — they are NOT disabled or greyed out
  // to the point of being invisible. They simply have no CTA until unlocked.
  const isStepLocked = (index: number): boolean => {
    if (index === 0) return false;
    return !completedSteps.includes(STEPS[index - 1].id);
  };

  // Auto-dismiss after all steps complete — give user 2 s to see the success state
  React.useEffect(() => {
    if (allComplete) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [allComplete, onDismiss]);

  return (
    <div
      className={cn(
        "mb-6 rounded-lg border bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-700",
        // Blue left accent = active / in progress (H1: Visibility of system status)
        "border-l-4 border-l-blue-600 dark:border-l-blue-400",
      )}
      role="region"
      aria-label="Workspace setup checklist"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {allComplete
              ? "You're all set! 🎉"
              : "Complete your workspace setup"}
          </h2>
          {/* Progress always visible even when collapsed — H1 */}
          <ProgressBar completed={completedCount} total={STEPS.length} />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Collapse toggle — H3: User control */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1.5 rounded-md text-gray-400 dark:text-gray-500",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            )}
            aria-expanded={!isCollapsed}
            aria-controls="checklist-steps"
            aria-label={isCollapsed ? "Expand checklist" : "Collapse checklist"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>

          {/* Dismiss — H3: Clearly marked emergency exit */}
          <button
            onClick={onDismiss}
            className={cn(
              "p-1.5 rounded-md text-gray-400 dark:text-gray-500",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "hover:text-gray-600 dark:hover:text-gray-300",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            )}
            aria-label="Dismiss setup checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Steps — H6: Full journey visible at once, recognition over recall ── */}
      {!isCollapsed && (
        <div
          id="checklist-steps"
          className="px-4 pb-4 divide-y divide-gray-100 dark:divide-gray-800"
        >
          {STEPS.map((step, index) => (
            <StepRow
              key={step.id}
              step={step}
              isComplete={completedSteps.includes(step.id)}
              isLocked={isStepLocked(index)}
              onAction={stepActions[step.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;