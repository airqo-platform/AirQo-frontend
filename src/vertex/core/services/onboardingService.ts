import { secureApiProxy } from '@/core/utils/secureApiProxyClient';

export type OnboardingAction = 'mark_step_complete' | 'dismiss_checklist';

export interface UpdateOnboardingPayload {
  action: OnboardingAction;
  step_id?: string;
}

export class OnboardingService {
  /**
   * Updates the onboarding checklist state for the current personal user.
   */
  async updateUserOnboarding(payload: UpdateOnboardingPayload) {
    const response = await secureApiProxy.patch('/users/onboarding', payload, {
      headers: { 'X-Auth-Type': 'JWT' },
    });
    return response.data;
  }

  /**
   * Updates the onboarding checklist state for a specific organization/group.
   */
  async updateGroupOnboarding(groupId: string, payload: UpdateOnboardingPayload) {
    const response = await secureApiProxy.patch(
      `/users/groups/${groupId}/onboarding`,
      payload,
      { headers: { 'X-Auth-Type': 'JWT' } }
    );
    return response.data;
  }
}

// Export a singleton instance
export const onboardingService = new OnboardingService();
