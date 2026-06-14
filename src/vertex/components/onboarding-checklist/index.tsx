import React, { useMemo, useEffect, useRef } from 'react';
import ChecklistUI from './ChecklistUI';
import { useOnboarding } from '@/core/hooks/useOnboarding';
import { useAppSelector } from '@/core/redux/hooks';
import { formatTitle } from '@/components/features/org-picker/organization-picker';
import ReusableToast from '@/components/shared/toast/ReusableToast';

interface OnboardingChecklistWrapperProps {
  autoCompletedSteps: string[];
  onAddDevice: () => void;
  onGoToCohorts: () => void;
  onGoToVisibility?: () => void;
  canClaimDevice: boolean;
  isLoadingGroupDetailsSafe: boolean;
}

export default function OnboardingChecklistWrapper({
  autoCompletedSteps,
  onAddDevice,
  onGoToCohorts,
  onGoToVisibility,
  canClaimDevice,
  isLoadingGroupDetailsSafe,
}: OnboardingChecklistWrapperProps) {
  const { activeChecklistState, updateChecklist, userScope } = useOnboarding();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const TOTAL_STEPS = 3;

  const visuallyCompletedSteps = useMemo(() => {
    return Array.from(new Set([...(activeChecklistState.completedSteps || []), ...autoCompletedSteps]));
  }, [activeChecklistState.completedSteps, autoCompletedSteps]);

  const allStepsComplete = visuallyCompletedSteps.length >= TOTAL_STEPS;
  const showChecklist =
    !allStepsComplete && !activeChecklistState.dismissed && !isLoadingGroupDetailsSafe && !activeChecklistState.isMissing;

  if (!showChecklist) {
    return null;
  }

  return (
    <ChecklistUI
      completedSteps={visuallyCompletedSteps}
      onDismiss={() => {
        if (isMounted.current) {
          updateChecklist({ action: 'dismiss_checklist' });
        }
      }}
      onAddDevice={onAddDevice}
      onGoToCohorts={onGoToCohorts}
      onGoToVisibility={
        onGoToVisibility
          ? () => {
              const nextCompletedSteps = Array.from(new Set([...visuallyCompletedSteps, 'set-visibility']));
              const justCompletedSetup =
                !visuallyCompletedSteps.includes('set-visibility') && nextCompletedSteps.length >= TOTAL_STEPS;

              updateChecklist({
                action: 'mark_step_complete',
                step_id: 'set-visibility',
              });
              onGoToVisibility();

              if (justCompletedSetup) {
                ReusableToast({
                  message: "Workspace setup complete. You're ready to monitor and manage your devices.",
                  type: 'SUCCESS',
                });
                setTimeout(() => {
                  if (isMounted.current) {
                    updateChecklist({ action: 'dismiss_checklist' });
                  }
                }, 2000);
              }
            }
          : undefined
      }
      onMarkAsDone={() => {
        // This is handled visually by ChecklistUI, but we can do any extra side effects here if needed.
      }}
      organizationName={formatTitle(activeGroup?.grp_title || '')}
      isReadOnly={!canClaimDevice}
    />
  );
}
