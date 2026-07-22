/**
 * Unit tests for SubscriptionService pure helper functions.
 *
 * The subscriptionService.ts file exports only the class and singleton,
 * so these tests exercise the public API through mocked HTTP calls,
 * verifying normalization logic and error handling without network I/O.
 */
jest.mock('@/shared/services/apiClient', () => ({
  createAuthenticatedClient: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  })),
}));

jest.mock('@/shared/services/sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn().mockResolvedValue(undefined),
}));

import { SubscriptionService } from '@/shared/services/subscriptionService';

function createService() {
  return new SubscriptionService();
}

describe('SubscriptionService', () => {
  describe('getPlans', () => {
    it('returns default plans with all tiers', async () => {
      const service = createService();
      const result = await service.getPlans();

      expect(result.success).toBe(true);
      expect(result.plans).toHaveLength(3);
      expect(result.plans.map(p => p.tier)).toEqual([
        'Free',
        'Standard',
        'Premium',
      ]);
    });

    it('includes limits for each plan', async () => {
      const service = createService();
      const result = await service.getPlans();

      result.plans.forEach(plan => {
        expect(plan.limits).toBeDefined();
        expect(plan.limits.hourly).toBeGreaterThan(0);
        expect(plan.limits.daily).toBeGreaterThan(0);
        expect(plan.limits.monthly).toBeGreaterThan(0);
      });
    });

    it('Free tier has zero price', async () => {
      const service = createService();
      const result = await service.getPlans();

      const freePlan = result.plans.find(p => p.tier === 'Free');
      expect(freePlan?.price).toBe(0);
    });
  });

  describe('reactivateSubscription', () => {
    it('returns a message directing to checkout', async () => {
      const service = createService();
      const result = await service.reactivateSubscription();

      expect(result.success).toBe(false);
      expect(result.message).toContain('checkout');
    });
  });
});
