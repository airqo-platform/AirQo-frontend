'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import { AqCheck } from '@airqo/icons-react';
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

type ConfirmationAction = 'enableAutoRenew' | 'disableAutoRenew' | 'cancel';
type RunningAction = 'checkout' | ConfirmationAction | null;

interface ExtendedSessionUser {
  _id?: string;
}

const statusBadgeStyles: Record<string, string> = {
  active:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  trialing: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  past_due:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  cancelled:
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  paused:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
};

const statusLabels: Record<UserSubscription['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  trialing: 'Trialing',
  past_due: 'Past due',
  cancelled: 'Ended',
  paused: 'Paused',
};

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
  const [runningAction, setRunningAction] = useState<RunningAction>(null);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<ConfirmationAction | null>(null);
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
      return 'Scheduled to end';
    }

    return statusLabels[currentStatus] || currentStatus.replace('_', ' ');
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
  const statusNotice = useMemo(() => {
    if (currentStatus === 'past_due') {
      return {
        tone: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200',
        eyebrow: 'Action required',
        title: 'We could not complete your latest renewal',
        message:
          'Retry billing or update your payment setup to keep API access active without interruption.',
      };
    }

    if (currentStatus === 'cancelled') {
      if (accessDateText) {
        return {
          tone: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200',
          eyebrow: 'Renewal off',
          title: `Paid access remains available through ${accessDateText}`,
          message:
            'Automatic renewal is off for this subscription. Resume renewal before that date to continue service without interruption.',
        };
      }

      return {
        tone: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
        eyebrow: 'Subscription ended',
        title: 'This paid plan is no longer active',
        message:
          'Your account is currently on the Free tier. Choose a paid plan below whenever you need higher API capacity again.',
      };
    }

    if (currentStatus === 'paused') {
      return {
        tone: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-200',
        eyebrow: 'Subscription paused',
        title: 'Billing is paused for this plan',
        message:
          'Resume renewal when you are ready to restart scheduled billing and higher-rate access.',
      };
    }

    if (currentTier !== 'Free' && !subscription?.automaticRenewal) {
      return {
        tone: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200',
        eyebrow: 'Renewal off',
        title: accessDateText
          ? `Your plan stays active through ${accessDateText}`
          : 'Automatic renewal is turned off',
        message: accessDateText
          ? 'Resume renewal before that date to continue service without interruption.'
          : 'This plan will remain available until the current access period ends and will not renew automatically.',
      };
    }

    return null;
  }, [
    accessDateText,
    currentStatus,
    currentTier,
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

      if (typeof window === 'undefined' || !window.Paddle?.Checkout?.open) {
        throw new Error('Checkout overlay is unavailable right now');
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
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/70 p-6 shadow-sm dark:border-slate-800/70">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/80 via-white to-emerald-50/80 pointer-events-none dark:from-orange-950/20 dark:via-slate-950 dark:to-emerald-950/20" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Active Access Tier
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {currentTier}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {currentPlan
                  ? `${currentPlan.currency} ${currentPlan.price}/month`
                  : 'Subscription status from your account profile'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[currentStatus] || statusBadgeStyles.inactive}`}
              >
                {currentStatusLabel}
              </span>
              {subscription?.automaticRenewal && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                  Renewal on
                </span>
              )}
              {!subscription?.automaticRenewal && currentTier !== 'Free' && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Renewal off
                </span>
              )}
            </div>
          </div>

          {statusNotice && (
            <div
              className={`relative mt-5 rounded-2xl border px-5 py-4 ${statusNotice.tone}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                {statusNotice.eyebrow}
              </p>
              <p className="mt-2 text-base font-semibold">
                {statusNotice.title}
              </p>
              <p className="mt-2 text-sm leading-6">{statusNotice.message}</p>
            </div>
          )}

          <div className="relative mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {summaryDateLabel}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {summaryDateValue}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Last Renewal
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {subscription?.lastRenewalDate
                  ? formatDate(subscription.lastRenewalDate, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'No renewals yet'}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            {canManageAutoRenew && !subscription?.automaticRenewal && (
              <Button
                variant="outlined"
                onClick={() => setPendingConfirmation('enableAutoRenew')}
                disabled={runningAction === 'enableAutoRenew'}
                loading={runningAction === 'enableAutoRenew'}
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
                className="border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                Cancel Plan
              </Button>
            )}
          </div>

          <p className="relative mt-4 text-xs text-gray-500 dark:text-gray-400">
            Included request limits are listed in the plan cards below for quick
            comparison.
          </p>
        </Card>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Available Plans
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose the API access tier that matches your usage and traffic
            profile.
          </p>

          {hasPlans ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {plans.map(plan => {
                const isCurrent = plan.tier === currentTier;
                const isCurrentFreePlan = isCurrent && plan.tier === 'Free';
                const isCurrentPlanPendingExpiry =
                  isCurrent &&
                  currentStatus === 'cancelled' &&
                  Boolean(accessDateText);
                const allowCheckout =
                  plan.tier !== 'Free' &&
                  (!isCurrent ||
                    currentStatus === 'past_due' ||
                    (currentStatus === 'cancelled' &&
                      !isCurrentPlanPendingExpiry) ||
                    currentStatus === 'paused');
                const isUpgrade =
                  currentTier === 'Free' ||
                  (currentPlan ? plan.price > currentPlan.price : false);
                const actionLabel = isCurrent
                  ? isCurrentFreePlan
                    ? 'Included plan'
                    : currentStatus === 'past_due'
                      ? 'Retry billing'
                      : currentStatus === 'cancelled'
                        ? isCurrentPlanPendingExpiry
                          ? 'Current plan'
                          : 'Reactivate plan'
                        : currentStatus === 'paused'
                          ? 'Resume plan'
                          : 'Current plan'
                  : allowCheckout
                    ? isUpgrade
                      ? `Upgrade to ${plan.name}`
                      : `Switch to ${plan.name}`
                    : 'Unavailable';

                return (
                  <Card
                    key={plan.tier}
                    className={`p-5 flex flex-col ${
                      isCurrent
                        ? 'ring-2 ring-primary/60 border-primary/40'
                        : 'hover:shadow-md transition-shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {plan.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {plan.currency} {plan.price}/month
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
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
                      className="mt-5"
                      variant={isCurrent ? 'outlined' : 'filled'}
                      disabled={!allowCheckout}
                      onClick={() => handleOpenCheckout(plan)}
                    >
                      {actionLabel}
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-dashed border-gray-300 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400">
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
        onClose={() => {
          setDialogOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        currentTier={currentTier}
        loading={runningAction === 'checkout'}
        onConfirm={handleCheckoutConfirm}
      />
    </>
  );
};

export default SubscriptionSection;
