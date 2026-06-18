import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { onboardingService, UpdateOnboardingPayload } from '../services/onboardingService';
import { setUserDetails, setActiveGroup } from '../redux/slices/userSlice';
import { useAppSelector } from '../redux/hooks';
import logger from '@/lib/logger';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

export const useOnboarding = () => {
  const dispatch = useDispatch();
  const { userContext, userDetails: user, activeGroup, groupDetails } = useAppSelector((state: any) => state.user);
  const userScope = userContext === 'external-org' ? 'organisation' : 'personal';

  const activeChecklistState = React.useMemo(() => {
    if (userScope === 'organisation') {
      const checklistSrc = activeGroup?.onboarding_checklist ?? groupDetails?.onboarding_checklist;
      return {
        completedSteps: checklistSrc?.completed_steps || [],
        dismissed: checklistSrc?.is_dismissed || false,
        isMissing: !checklistSrc,
      };
    }
    const userChecklistSrc = user?.onboarding_checklist;
    return {
      completedSteps: userChecklistSrc?.completed_steps || [],
      dismissed: userChecklistSrc?.is_dismissed || false,
      isMissing: !userChecklistSrc,
    };
  }, [userScope, activeGroup?.onboarding_checklist, groupDetails?.onboarding_checklist, user?.onboarding_checklist]);

  const { mutateAsync: updateUserOnboarding } = useMutation({
    mutationFn: (payload: UpdateOnboardingPayload) => onboardingService.updateUserOnboarding(payload),
  });

  const { mutateAsync: updateGroupOnboarding } = useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: UpdateOnboardingPayload }) =>
      onboardingService.updateGroupOnboarding(groupId, payload),
  });

  const updateChecklist = React.useCallback(
    async (patch: { action?: 'mark_step_complete' | 'dismiss_checklist'; step_id?: string }) => {
      if (!patch.action) return;

      if (userScope === 'personal' && user) {
        try {
          const res = await updateUserOnboarding({ action: patch.action, step_id: patch.step_id });
          const updatedChecklist =
            res.data?.onboarding_checklist || res.user?.onboarding_checklist || res.onboarding_checklist;

          if (res.success && updatedChecklist) {
            dispatch(
              setUserDetails({
                ...user,
                onboarding_checklist: updatedChecklist,
              })
            );
          }
        } catch (error) {
          logger.error('Failed to update personal onboarding checklist:', { error: getApiErrorMessage(error) });
        }
        return;
      }

      if (userScope === 'organisation' && activeGroup?._id) {
        try {
          const res = await updateGroupOnboarding({
            groupId: activeGroup._id,
            payload: { action: patch.action, step_id: patch.step_id },
          });
          const updatedChecklist =
            res.data?.onboarding_checklist || res.group?.onboarding_checklist || res.onboarding_checklist;

          if (res.success && updatedChecklist) {
            dispatch(
              setActiveGroup({
                ...activeGroup,
                onboarding_checklist: updatedChecklist,
              })
            );
          }
        } catch (error) {
          logger.error('Failed to update group onboarding checklist:', { error: getApiErrorMessage(error) });
        }
      }
    },
    [userScope, user, activeGroup, dispatch, updateUserOnboarding, updateGroupOnboarding]
  );

  return {
    userScope,
    activeChecklistState,
    updateChecklist,
  };
};
