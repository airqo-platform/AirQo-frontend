import { useMutation } from "@tanstack/react-query";
import { users } from "../apis/users";

export const useUpdateUserOnboarding = () => {
  return useMutation({
    mutationFn: (payload: { action: 'mark_step_complete' | 'dismiss_checklist'; step_id?: string }) =>
      users.updateUserOnboardingApi(payload),
  });
};
