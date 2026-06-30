'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import { AqAlertTriangle, AqCheck } from '@airqo/icons-react';
import { Button, Card, LoadingSpinner, toast } from '@/shared/components/ui';
import ReusableDialog from '@/shared/components/ui/dialog';
import { PADDLE_CHECKOUT_COMPLETED_EVENT } from '@/shared/lib/paddle';
import { formatDate } from '@/shared/utils';
import { subscriptionService } from '@/shared/services/subscriptionService';
import type {
  SubscriptionPlan,
  SubscriptionTier,
  UserSubscription,
} from '@/shared/types/api';
import CheckoutDialog from './CheckoutDialog';

const BILLING_SERVICE_UNAVAILABLE_MESSAGE =
  'Billing service is temporarily unavailable. Please try again later.';

const CHECKOUT_STATUS_POLL_INTERVAL_MS = 2000;
const CHECKOUT_STATUS_MAX_ATTEMPTS = 6;
const ACCENT_FILLED_BUTTON_CLASS =
  'border border-[#DA7B00] bg-[#DA7B00] text-white hover:!border-[#B86500] hover:!bg-[#B86500] focus:ring-[#DA7B00] disabled:opacity-50';
const ACCENT_OUTLINED_BUTTON_CLASS =
  'border-[#DA7B00] text-[#DA7B00] hover:!border-[#DA7B00] hover:!bg-[#DA7B00] hover:!text-white focus:ring-[#DA7B00]';
const NEUTRAL_OUTLINED_BUTTON_CLASS =
  'border-slate-300 text-slate-700 hover:!border-slate-900 hover:!bg-slate-900 hover:!text-white dark:border-slate-700 dark:text-slate-100 dark:hover:!border-slate-200 dark:hover:!bg-slate-200 dark:hover:!text-slate-950';

type ConfirmationAction = 'enableAutoRenew' | 'disableAutoRenew' | 'cancel';
type PlanActionMode = 'checkout' | 'upgrade' | 'downgrade';
type RunningAction = 'checkout' | 'changeTier' | ConfirmationAction | null;
type ActivePaidTier = Extract<SubscriptionTier, 'Standard' | 'Premium'>;

interface PendingTierChange {
  previousTier: ActivePaidTier;
  newTier: ActivePaidTier;
  effectiveFrom: 'immediately' | 'next_billing_period';
}

interface PlanActionConfig {
  label: string;
  mode: PlanActionMode;
  disabled: boolean;
  variant: 'filled' | 'outlined';
  helperText: string;
}

interface ExtendedSessionUser {
  _id?: string;
}

const statusBadgeStyles: Record<
  UserSubscription['status'],
  { container: string; dot: string; label: string }
> = {
  active: {
    container:
      'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  inactive: {
    container:
      'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    dot: 'bg-slate-400',
    label: 'Inactive',
  },
  trialing: {
    container:
      'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200',
    dot: 'bg-sky-500',
    label: 'Trialing',
  },
  past_due: {
    container:
      'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200',
    dot: 'bg-amber-500',
    label: 'Past due',
  },
  cancelled: {
    container:
      'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    dot: 'bg-slate-500',
    label: 'Ended',
  },
  paused: {
    container:
      'border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-200',
    dot: 'bg-violet-500',
    label: 'Paused',
  },
};

const noticeToneStyles = {
  warning: {
    container:
      'border-[#F4C267] bg-[#FFF7E6] dark:border-amber-800/60 dark:bg-amber-950/20',
    icon: 'text-[#DA7B00] dark:text-amber-300',
    title: 'text-[#9A4D00] dark:text-amber-100',
    body: 'text-[#B56200] dark:text-amber-200',
  },
  info: {
    container:
      'border-sky-200 bg-sky-50 dark:border-sky-800/60 dark:bg-sky-950/20',
    icon: 'text-sky-600 dark:text-sky-300',
    title: 'text-sky-900 dark:text-sky-100',
    body: 'text-sky-700 dark:text-sky-200',
  },
  critical: {
    container:
      'border-rose-200 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/20',
    icon: 'text-rose-600 dark:text-rose-300',
    title: 'text-rose-900 dark:text-rose-100',
    body: 'text-rose-700 dark:text-rose-200',
  },
} as const;

const getPaidTier = (tier: SubscriptionTier): ActivePaidTier | null => {
  if (tier === 'Standard' || tier === 'Premium') {
    return tier;
  }

  return null;
};

const isSwitchablePaidStatus = (
  status: UserSubscription['status'],
  hasAccessWindow: boolean
): boolean =>
  status === 'active' ||
  status === 'trialing' ||
  (status === 'cancelled' && hasAccessWindow);

const getBillingErrorLogMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && code.trim()) {
      return code.trim();
    }
  }

  return 'Unknown billing error';
};

const delay = (milliseconds: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });

const SubscriptionSection: React.FC = () => {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [planActionMode, setPlanActionMode] =
    useState<PlanActionMode>('checkout');
  const [runningAction, setRunningAction] = useState<RunningAction>(null);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<ConfirmationAction | null>(null);
  const [pendingTierChange, setPendingTierChange] =
    useState<PendingTierChange | null>(null);
  const isMountedRef = useRef(true);
  const userId =
    (session?.user as ExtendedSessionUser | null)?._id?.trim() || '';

  const currentTier: SubscriptionTier = subscription?.tier || 'Free';
  const currentStatus = subscription?.status || 'inactive';
  const accessDateText = useMemo(() => {
    if (!subscription?.nextBillingDate) {
      return null;
    }

    return formatDate(subscription.nextBillingDate, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [subscription?.nextBillingDate]);
  const currentStatusLabel = useMemo(() => {
    if (currentStatus === 'cancelled' && accessDateText) {
      return 'Ending soon';
    }

    return (
      statusBadgeStyles[currentStatus]?.label || currentStatus.replace('_', ' ')
    );
  }, [accessDateText, currentStatus]);
  const summaryDateLabel = useMemo(() => {
    if (currentTier === 'Free' && currentStatus !== 'cancelled') {
      return 'Plan status';
    }

    if (currentStatus === 'cancelled' && !accessDateText) {
      return 'Plan status';
    }

    return subscription?.automaticRenewal
      ? 'Next renewal date'
      : 'Access through';
  }, [
    accessDateText,
    currentStatus,
    currentTier,
    subscription?.automaticRenewal,
  ]);
  const summaryDateValue = useMemo(() => {
    if (currentTier === 'Free' && currentStatus !== 'cancelled') {
      return 'Free tier';
    }

    if (currentStatus === 'cancelled' && !accessDateText) {
      return 'Ended';
    }

    return accessDateText || 'Not scheduled';
  }, [accessDateText, currentStatus, currentTier]);

  const refreshData = useCallback(async () => {
    setLoading(true);

    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        subscriptionService.getSubscription(),
        subscriptionService.getPlans(),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setSubscription(
        subscriptionResponse.success
          ? (subscriptionResponse.subscription ?? null)
          : null
      );

      setPlans(
        plansResponse.success && Array.isArray(plansResponse.plans)
          ? plansResponse.plans
          : []
      );
    } catch (error) {
      console.error(
        `Error loading subscription view: ${getBillingErrorLogMessage(error)}`
      );
      toast.error('Failed to load subscription data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void refreshData();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshData]);

  const currentPlan = useMemo(
    () => plans.find(plan => plan.tier === currentTier),
    [plans, currentTier]
  );

  useEffect(() => {
    if (!pendingTierChange) {
      return;
    }

    if (currentTier === pendingTierChange.newTier || currentTier === 'Free') {
      setPendingTierChange(null);
    }
  }, [currentTier, pendingTierChange]);

  const statusNotice = useMemo(() => {
    if (pendingTierChange?.effectiveFrom === 'next_billing_period') {
      const accessWindow =
        accessDateText || 'the end of your current billing period';

      return {
        tone: 'info' as const,
        title: `Downgrade to ${pendingTierChange.newTier} is scheduled`,
        message: `You will keep ${pendingTierChange.previousTier} access until ${accessWindow}.`,
      };
    }

    if (currentStatus === 'past_due') {
      return {
        tone: 'critical' as const,
        title: 'We could not complete your latest renewal',
        message:
          'Retry billing or update your payment setup to keep API access active without interruption.',
      };
    }

    if (currentStatus === 'cancelled') {
      if (accessDateText) {
        return {
          tone: 'warning' as const,
          title: 'Automatic renewal is turned off',
          message:
            'This plan will remain available until the current access period ends and will not renew automatically.',
        };
      }

      return {
        tone: 'info' as const,
        title: 'This paid plan is no longer active',
        message:
          'Your account is currently on the Free tier. Choose a paid plan below whenever you need higher API capacity again.',
      };
    }

    if (currentStatus === 'paused') {
      return {
        tone: 'info' as const,
        title: 'Billing is paused for this plan',
        message:
          'Resume renewal when you are ready to restart scheduled billing and higher-rate access.',
      };
    }

    if (currentTier !== 'Free' && !subscription?.automaticRenewal) {
      return {
        tone: 'warning' as const,
        title: 'Automatic renewal is turned off',
        message: accessDateText
          ? 'This plan will remain available until the current access period ends and will not renew automatically.'
          : 'This plan will remain available until the current access period ends and will not renew automatically.',
      };
    }

    return null;
  }, [
    accessDateText,
    currentStatus,
    currentTier,
    pendingTierChange,
    subscription?.automaticRenewal,
  ]);
  const confirmationDialog = useMemo(() => {
    if (!pendingConfirmation) {
      return null;
    }

    const accessWindow =
      accessDateText || 'the end of the current billing period';

    if (pendingConfirmation === 'enableAutoRenew') {
      return {
        title: 'Resume automatic renewal?',
        subtitle: 'Keep this plan renewing on its scheduled billing cycle.',
        body: 'We will update your billing settings so this subscription renews automatically on the next scheduled billing date.',
        confirmLabel: 'Resume renewal',
        secondaryLabel: 'Not now',
      };
    }

    if (pendingConfirmation === 'disableAutoRenew') {
      return {
        title: 'Turn off automatic renewal?',
        subtitle:
          'Your current plan remains available until the active access period ends.',
        body: `After ${accessWindow}, this subscription will stop renewing automatically unless you turn renewal back on first.`,
        confirmLabel: 'Turn off renewal',
        secondaryLabel: 'Keep renewal on',
      };
    }

    return {
      title: 'Cancel this subscription?',
      subtitle:
        'We will send the cancellation request to the billing provider and refresh the latest status here.',
      body: 'Use this option only if you want to end the current subscription record. If you only want to stop the next renewal, choose Turn off renewal instead.',
      confirmLabel: 'Cancel subscription',
      secondaryLabel: 'Keep subscription',
      confirmClassName:
        'text-sm bg-rose-600 hover:bg-rose-700 focus:ring-rose-600 text-white disabled:opacity-50',
    };
  }, [accessDateText, pendingConfirmation]);
  const confirmationLoading =
    pendingConfirmation !== null && runningAction === pendingConfirmation;
  const hasPlans = plans.length > 0;
  const canManageAutoRenew =
    currentTier !== 'Free' &&
    (currentStatus === 'active' ||
      currentStatus === 'trialing' ||
      currentStatus === 'cancelled');
  const canCancelSubscription =
    currentTier !== 'Free' &&
    currentStatus !== 'inactive' &&
    currentStatus !== 'cancelled';
  const hasSwitchablePaidSubscription =
    currentTier !== 'Free' &&
    isSwitchablePaidStatus(currentStatus, Boolean(accessDateText));
  const isPlanActionLoading =
    runningAction === 'checkout' || runningAction === 'changeTier';

  const closePlanDialog = useCallback(() => {
    if (isPlanActionLoading) {
      return;
    }

    setDialogOpen(false);
    setSelectedPlan(null);
    setPlanActionMode('checkout');
  }, [isPlanActionLoading]);

  const syncSubscriptionAfterCheckout = useCallback(async () => {
    let latestSubscription: UserSubscription | null = null;

    for (
      let attempt = 0;
      attempt < CHECKOUT_STATUS_MAX_ATTEMPTS;
      attempt += 1
    ) {
      if (!isMountedRef.current) {
        return latestSubscription;
      }

      const response = await subscriptionService.getSubscription();

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to refresh subscription status'
        );
      }

      latestSubscription = response.subscription ?? null;

      if (isMountedRef.current) {
        setSubscription(latestSubscription);
      }

      if (latestSubscription?.status === 'active') {
        return latestSubscription;
      }

      if (attempt < CHECKOUT_STATUS_MAX_ATTEMPTS - 1) {
        await delay(CHECKOUT_STATUS_POLL_INTERVAL_MS);
      }
    }

    return latestSubscription;
  }, []);

  useEffect(() => {
    const handleCheckoutCompleted = () => {
      void syncSubscriptionAfterCheckout().catch(error => {
        console.error(
          `Checkout sync error: ${getBillingErrorLogMessage(error)}`
        );
        toast.error('Payment completed, but the subscription sync failed');
      });
    };

    window.addEventListener(
      PADDLE_CHECKOUT_COMPLETED_EVENT,
      handleCheckoutCompleted
    );

    return () => {
      window.removeEventListener(
        PADDLE_CHECKOUT_COMPLETED_EVENT,
        handleCheckoutCompleted
      );
    };
  }, [syncSubscriptionAfterCheckout]);

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPlanActionMode('checkout');
    setDialogOpen(true);
  };

  const handleOpenPlanDialog = (
    plan: SubscriptionPlan,
    mode: PlanActionMode
  ) => {
    setSelectedPlan(plan);
    setPlanActionMode(mode);
    setDialogOpen(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedPlan) {
      return;
    }

    if (!userId) {
      toast.error(
        'Unable to determine the current user. Please refresh and try again.'
      );
      return;
    }

    try {
      setRunningAction('checkout');

      const payload = await subscriptionService.createCheckoutSession({
        userId,
        tier: selectedPlan.tier,
        currency: selectedPlan.currency?.trim() || 'USD',
      });

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(payload.message || 'Failed to create checkout session');
      }

      const sessionId = payload?.data?.sessionId;
      if (!sessionId) {
        throw new Error('Checkout session did not return a Paddle session ID');
      }

      const maxWaitMs = 10_000;
      const pollMs = 250;
      let waited = 0;

      while (
        typeof window !== 'undefined' &&
        (!window.Paddle?.Checkout?.open ||
          typeof window.Paddle.Initialize !== 'function') &&
        waited < maxWaitMs
      ) {
        await delay(pollMs);
        waited += pollMs;
      }

      if (typeof window === 'undefined' || !window.Paddle?.Checkout?.open) {
        throw new Error(
          'The payment provider failed to load. Please refresh the page and try again.'
        );
      }

      window.Paddle.Checkout.open({
        transactionId: sessionId,
      });
    } catch (error) {
      console.error(`Checkout error: ${getBillingErrorLogMessage(error)}`);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to start checkout right now'
      );
    } finally {
      setRunningAction(null);
      setDialogOpen(false);
      setSelectedPlan(null);
      setPlanActionMode('checkout');
    }
  };

  const handleChangeTierConfirm = async () => {
    if (!selectedPlan) {
      return;
    }

    if (selectedPlan.tier !== 'Standard' && selectedPlan.tier !== 'Premium') {
      toast.error('Only Standard and Premium tiers can be switched here.');
      return;
    }

    try {
      setRunningAction('changeTier');

      const payload = await subscriptionService.changeTier(selectedPlan.tier);

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(
          payload.message || 'Failed to change subscription tier'
        );
      }

      const previousTier =
        payload.data?.previousTier || getPaidTier(currentTier);
      const effectiveFrom =
        payload.data?.effectiveFrom ||
        (currentPlan && selectedPlan.price > currentPlan.price
          ? 'immediately'
          : 'next_billing_period');

      if (
        effectiveFrom === 'next_billing_period' &&
        previousTier &&
        selectedPlan.tier !== previousTier
      ) {
        setPendingTierChange({
          previousTier,
          newTier: selectedPlan.tier,
          effectiveFrom,
        });
        toast.success(
          'Downgrade scheduled',
          payload.message ||
            `Downgrade to ${selectedPlan.tier} will apply next billing period.`
        );
      } else {
        setPendingTierChange(null);
        toast.success(
          'Plan updated',
          payload.message || `You are now on the ${selectedPlan.tier} plan.`
        );
      }

      await refreshData();
    } catch (error) {
      console.error(`Change tier error: ${getBillingErrorLogMessage(error)}`);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to change subscription tier'
      );
    } finally {
      setRunningAction(null);
      setDialogOpen(false);
      setSelectedPlan(null);
      setPlanActionMode('checkout');
    }
  };

  const handleEnableAutoRenew = async () => {
    try {
      setRunningAction('enableAutoRenew');

      const payload = await subscriptionService.enableAutoRenewal();

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(
          payload.message || 'Failed to enable automatic renewal'
        );
      }

      await refreshData();
      toast.success(
        'Renewal resumed',
        payload.message ||
          'This plan will continue renewing automatically on its scheduled billing date.'
      );
    } catch (error) {
      console.error(`Auto-renewal error: ${getBillingErrorLogMessage(error)}`);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update automatic renewal'
      );
    } finally {
      setRunningAction(null);
      setPendingConfirmation(null);
    }
  };

  const handleDisableAutoRenew = async () => {
    try {
      setRunningAction('disableAutoRenew');

      const payload = await subscriptionService.disableAutoRenewal();

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(
          payload.message || 'Failed to disable automatic renewal'
        );
      }

      await refreshData();
      toast.success(
        'Renewal turned off',
        payload.message ||
          'The current plan will remain available until the active period ends.'
      );
    } catch (error) {
      console.error(
        `Disable auto-renewal error: ${getBillingErrorLogMessage(error)}`
      );
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update automatic renewal'
      );
    } finally {
      setRunningAction(null);
      setPendingConfirmation(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setRunningAction('cancel');

      const payload = await subscriptionService.cancelSubscription();

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(payload.message || 'Failed to cancel subscription');
      }

      await refreshData();
      toast.success(
        'Subscription updated',
        payload.message ||
          'The latest billing status has been applied to your account.'
      );
    } catch (error) {
      console.error(
        `Cancel subscription error: ${getBillingErrorLogMessage(error)}`
      );
      toast.error(
        error instanceof Error ? error.message : 'Failed to cancel subscription'
      );
    } finally {
      setRunningAction(null);
      setPendingConfirmation(null);
    }
  };

  const getPlanActionConfig = useCallback(
    (plan: SubscriptionPlan): PlanActionConfig => {
      const isCurrent = plan.tier === currentTier;
      const isScheduledTarget =
        pendingTierChange?.effectiveFrom === 'next_billing_period' &&
        pendingTierChange.newTier === plan.tier;

      if (isCurrent) {
        if (plan.tier === 'Free') {
          return {
            label: 'Included plan',
            mode: 'checkout',
            disabled: true,
            variant: 'outlined',
            helperText: 'This is your current access level.',
          };
        }

        if (currentStatus === 'past_due') {
          return {
            label: 'Retry billing',
            mode: 'checkout',
            disabled: false,
            variant: 'filled',
            helperText: 'Open secure checkout to restore this plan.',
          };
        }

        if (currentStatus === 'paused') {
          return {
            label: 'Resume plan',
            mode: 'checkout',
            disabled: false,
            variant: 'filled',
            helperText: 'Open secure checkout to resume this plan.',
          };
        }

        if (currentStatus === 'cancelled' && !accessDateText) {
          return {
            label: 'Reactivate plan',
            mode: 'checkout',
            disabled: false,
            variant: 'filled',
            helperText: 'Start a new checkout session for this plan.',
          };
        }

        return {
          label: 'Current plan',
          mode: 'checkout',
          disabled: true,
          variant: 'outlined',
          helperText: pendingTierChange
            ? `Downgrade to ${pendingTierChange.newTier} is already scheduled.`
            : 'This is the tier your account is using right now.',
        };
      }

      if (plan.tier === 'Free') {
        return {
          label: 'Included plan',
          mode: 'checkout',
          disabled: true,
          variant: 'outlined',
          helperText:
            'Use Cancel Plan if you want to end paid access and return to Free.',
        };
      }

      if (isScheduledTarget) {
        return {
          label: 'Downgrade scheduled',
          mode: 'downgrade',
          disabled: true,
          variant: 'outlined',
          helperText: accessDateText
            ? `${plan.name} starts after ${accessDateText}.`
            : `${plan.name} starts next billing period.`,
        };
      }

      if (hasSwitchablePaidSubscription && currentPlan) {
        const isUpgrade = plan.price > currentPlan.price;

        return {
          label: isUpgrade
            ? `Upgrade to ${plan.name}`
            : `Downgrade to ${plan.name}`,
          mode: isUpgrade ? 'upgrade' : 'downgrade',
          disabled: false,
          variant: isUpgrade ? 'filled' : 'outlined',
          helperText: isUpgrade
            ? 'Applies immediately when confirmed.'
            : 'Keeps your current tier until the next billing period.',
        };
      }

      return {
        label:
          currentTier === 'Free'
            ? `Get ${plan.name}`
            : currentStatus === 'past_due'
              ? `Choose ${plan.name}`
              : currentStatus === 'paused'
                ? `Resume with ${plan.name}`
                : currentStatus === 'cancelled'
                  ? `Restart with ${plan.name}`
                  : `Continue with ${plan.name}`,
        mode: 'checkout',
        disabled: false,
        variant: 'filled',
        helperText: 'Secure checkout opens in a billing window.',
      };
    },
    [
      accessDateText,
      currentPlan,
      currentStatus,
      currentTier,
      hasSwitchablePaidSubscription,
      pendingTierChange,
    ]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="border border-slate-200/70 p-6 shadow-sm dark:border-slate-800/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Active Access Tier
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentTier}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  {currentPlan
                    ? `${currentPlan.currency} ${currentPlan.price} / month`
                    : currentTier === 'Free'
                      ? 'USD 0 / month'
                      : 'Subscription status from your account profile'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusBadgeStyles[currentStatus]?.container || statusBadgeStyles.inactive.container}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusBadgeStyles[currentStatus]?.dot || statusBadgeStyles.inactive.dot}`}
                />
                {currentStatusLabel}
              </span>

              {subscription?.automaticRenewal && currentTier !== 'Free' && (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                  Renewal on
                </span>
              )}

              {!subscription?.automaticRenewal && currentTier !== 'Free' && (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Renewal off
                </span>
              )}

              {pendingTierChange?.effectiveFrom === 'next_billing_period' && (
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200">
                  {`Downgrade to ${pendingTierChange.newTier} scheduled`}
                </span>
              )}
            </div>
          </div>

          {statusNotice && (
            <div
              className={`mt-5 rounded-md border px-5 py-5 ${noticeToneStyles[statusNotice.tone].container}`}
            >
              <div className="flex items-start gap-4">
                <AqAlertTriangle
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${noticeToneStyles[statusNotice.tone].icon}`}
                />

                <div>
                  <p
                    className={`text-base font-semibold ${noticeToneStyles[statusNotice.tone].title}`}
                  >
                    {statusNotice.title}
                  </p>
                  <p
                    className={`mt-1 text-sm leading-6 ${noticeToneStyles[statusNotice.tone].body}`}
                  >
                    {statusNotice.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {summaryDateLabel}
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {summaryDateValue}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Last Renewal
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {subscription?.lastRenewalDate
                  ? formatDate(subscription.lastRenewalDate, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'No renewals yet'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {canManageAutoRenew && !subscription?.automaticRenewal && (
              <Button
                variant="outlined"
                onClick={() => setPendingConfirmation('enableAutoRenew')}
                disabled={runningAction === 'enableAutoRenew'}
                loading={runningAction === 'enableAutoRenew'}
                className={ACCENT_OUTLINED_BUTTON_CLASS}
              >
                Resume Renewal
              </Button>
            )}

            {canManageAutoRenew && subscription?.automaticRenewal && (
              <Button
                variant="outlined"
                onClick={() => setPendingConfirmation('disableAutoRenew')}
                disabled={runningAction === 'disableAutoRenew'}
                loading={runningAction === 'disableAutoRenew'}
                className={ACCENT_OUTLINED_BUTTON_CLASS}
              >
                Turn Off Renewal
              </Button>
            )}

            {canCancelSubscription && (
              <Button
                variant="outlined"
                onClick={() => setPendingConfirmation('cancel')}
                disabled={runningAction === 'cancel'}
                loading={runningAction === 'cancel'}
              >
                Cancel Plan
              </Button>
            )}

            <p className="ml-4 text-sm text-slate-400 dark:text-slate-500">
              Request limits are listed in the plan cards below.
            </p>
          </div>
        </Card>

        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              Available Plans
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Switch tiers here when you already have paid access, or start a
              new checkout session when you are moving from Free or recovering a
              paused plan.
            </p>
          </div>

          {hasPlans ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {plans.map(plan => {
                const isCurrent = plan.tier === currentTier;
                const isScheduledTarget =
                  pendingTierChange?.effectiveFrom === 'next_billing_period' &&
                  pendingTierChange.newTier === plan.tier;
                const action = getPlanActionConfig(plan);
                const actionButtonClassName =
                  action.variant === 'filled'
                    ? ACCENT_FILLED_BUTTON_CLASS
                    : isCurrent || isScheduledTarget
                      ? NEUTRAL_OUTLINED_BUTTON_CLASS
                      : ACCENT_OUTLINED_BUTTON_CLASS;

                return (
                  <Card
                    key={plan.tier}
                    className={`p-5 flex flex-col ${
                      isCurrent
                        ? 'ring-2 ring-primary/60 border-primary/40'
                        : 'hover:shadow-md transition-shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {plan.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {plan.currency} {plan.price}/month
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                            Current
                          </span>
                        )}
                        {isScheduledTarget && (
                          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 text-xs text-gray-700 dark:text-gray-300">
                      <p>{plan.limits.hourly.toLocaleString()} requests/hour</p>
                      <p>{plan.limits.daily.toLocaleString()} requests/day</p>
                      <p>{plan.limits.weekly.toLocaleString()} requests/week</p>
                      <p>
                        {plan.limits.monthly.toLocaleString()} requests/month
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2 flex-1">
                      {plan.features.map(feature => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <AqCheck className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`mt-5 ${actionButtonClassName}`}
                      variant={action.variant}
                      disabled={action.disabled}
                      onClick={() =>
                        action.mode === 'checkout'
                          ? handleOpenCheckout(plan)
                          : handleOpenPlanDialog(plan, action.mode)
                      }
                    >
                      {action.label}
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Subscription plans are unavailable right now. Please refresh the
              page or try again later.
            </Card>
          )}
        </div>
      </div>

      {confirmationDialog && (
        <ReusableDialog
          isOpen={!!confirmationDialog}
          onClose={() => {
            if (!confirmationLoading) {
              setPendingConfirmation(null);
            }
          }}
          title={confirmationDialog.title}
          subtitle={confirmationDialog.subtitle}
          size="md"
          preventBackdropClose={confirmationLoading}
          showCloseButton={!confirmationLoading}
          primaryAction={{
            label: confirmationLoading
              ? 'Saving...'
              : confirmationDialog.confirmLabel,
            onClick: () => {
              if (pendingConfirmation === 'enableAutoRenew') {
                void handleEnableAutoRenew();
                return;
              }

              if (pendingConfirmation === 'disableAutoRenew') {
                void handleDisableAutoRenew();
                return;
              }

              void handleCancelSubscription();
            },
            loading: confirmationLoading,
            disabled: confirmationLoading,
            className: confirmationDialog.confirmClassName,
          }}
          secondaryAction={{
            label: confirmationDialog.secondaryLabel,
            onClick: () => setPendingConfirmation(null),
            disabled: confirmationLoading,
            variant: 'outlined',
          }}
          ariaLabel={confirmationDialog.title}
        >
          <div className="space-y-3">
            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
              {confirmationDialog.body}
            </p>
          </div>
        </ReusableDialog>
      )}

      <CheckoutDialog
        isOpen={dialogOpen}
        onClose={closePlanDialog}
        plan={selectedPlan}
        currentTier={currentTier}
        currentPlan={currentPlan}
        mode={planActionMode}
        accessUntilLabel={accessDateText}
        loading={isPlanActionLoading}
        onConfirm={() => {
          if (planActionMode === 'checkout') {
            void handleCheckoutConfirm();
            return;
          }

          void handleChangeTierConfirm();
        }}
      />
    </>
  );
};

export default SubscriptionSection;
