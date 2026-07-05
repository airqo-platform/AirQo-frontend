import React, { useMemo, useEffect, useRef } from 'react';
import ChecklistUI from './ChecklistUI';
import { useOnboarding } from '@/core/hooks/useOnboarding';
import { useAppSelector } from '@/core/redux/hooks';
import { formatTitle } from '@/components/features/org-picker/organization-picker';


interface OnboardingChecklistWrapperProps {
  autoCompletedSteps: string[];
  onAddDevice: () => void;
  onGoToCohorts: () => void;
  onGoToVisibility?: () => void;
  canClaimDevice: boolean;
  isLoadingGroupDetailsSafe: boolean;
  missingPermission?: string;
  missingPermissionDescription?: string;
}

export default function OnboardingChecklistWrapper({
  autoCompletedSteps,
  onAddDevice,
  onGoToCohorts,
  onGoToVisibility,
  canClaimDevice,
  isLoadingGroupDetailsSafe,
  missingPermission,
  missingPermissionDescription,
}: OnboardingChecklistWrapperProps) {
  const { activeChecklistState, updateChecklist } = useOnboarding();
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
      onGoToVisibility={onGoToVisibility}
      onMarkAsDone={() => {
        // This is handled visually by ChecklistUI, but we can do any extra side effects here if needed.
      }}
      organizationName={formatTitle(activeGroup?.grp_title || '')}
      isReadOnly={!canClaimDevice}
      missingPermission={!canClaimDevice ? missingPermission : undefined}
      missingPermissionDescription={!canClaimDevice ? missingPermissionDescription : undefined}
    />
  );
}
