'use client';

import React from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { AqArrowUp, AqCheck } from '@airqo/icons-react';
import type { SubscriptionPlan, SubscriptionTier } from '@/shared/types/api';

type PlanActionMode = 'checkout' | 'upgrade' | 'downgrade';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  currentTier: SubscriptionTier;
  currentPlan?: SubscriptionPlan | null;
  mode?: PlanActionMode;
  accessUntilLabel?: string | null;
  loading?: boolean;
  onConfirm: () => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onClose,
  plan,
  currentTier,
  currentPlan,
  mode = 'checkout',
  accessUntilLabel,
  loading = false,
  onConfirm,
}) => {
  const billingCycleLabel = 'monthly';
  const isCheckout = mode === 'checkout';
  const isDowngrade = mode === 'downgrade';

  const title = plan
    ? isCheckout
      ? `Get ${plan.name}?`
      : isDowngrade
        ? `Downgrade to ${plan.name}?`
        : `Upgrade to ${plan.name}?`
    : 'Review plan change';

  const subtitle = isCheckout
    ? 'Confirm this plan and continue in secure checkout.'
    : isDowngrade
      ? 'Your current tier remains active until the next billing period.'
      : 'Your new rate limits become available right away.';

  const primaryLabel = loading
    ? isCheckout
      ? 'Opening...'
      : 'Saving...'
    : isCheckout
      ? 'Continue to Checkout'
      : isDowngrade
        ? 'Confirm Downgrade'
        : 'Confirm Upgrade';

  const summaryMessage = isCheckout
    ? null
    : isDowngrade
      ? 'Switching to a lower tier schedules the change for your next billing period. Your current limits stay in place until then.'
      : 'Switching to a higher tier applies immediately. Your updated API limits and access are available as soon as the request succeeds.';

  const nextPeriodMessage = accessUntilLabel
    ? `You keep ${currentTier} access through ${accessUntilLabel}.`
    : `You keep ${currentTier} access until the end of your current billing period.`;

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={AqArrowUp}
      iconBgColor="bg-amber-50"
      iconColor="text-amber-600"
      primaryAction={{
        label: primaryLabel,
        onClick: onConfirm,
        disabled: !plan || loading,
        loading,
        className:
          'text-sm border border-[#DA7B00] bg-[#DA7B00] text-white hover:bg-[#B86500] hover:border-[#B86500] focus:ring-[#DA7B00] disabled:opacity-50',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: loading,
      }}
      size="lg"
      ariaLabel="Plan change confirmation"
    >
      <div className="space-y-5">
        {summaryMessage && (
          <div
            className={`rounded-lg border p-4 sm:p-5 ${
              isDowngrade
                ? 'border-amber-200 bg-amber-50/80'
                : 'border-slate-200 bg-slate-50/80'
            }`}
          >
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
              {summaryMessage}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
            <div className="rounded-lg bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                From
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {currentTier}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {currentPlan
                  ? `${currentPlan.currency} ${currentPlan.price} / ${billingCycleLabel}`
                  : '--'}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                to
              </span>
            </div>

            <div className="rounded-lg bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {isDowngrade
                  ? 'Scheduled Tier'
                  : isCheckout
                    ? 'Plan To Start'
                    : 'Tier To Activate'}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#DA7B00] dark:text-[#F1A43A]">
                {plan?.name || '--'}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {plan
                  ? `${plan.currency} ${plan.price} / ${billingCycleLabel}`
                  : '--'}
              </p>
            </div>
          </div>
        </div>

        {isDowngrade && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-4">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {nextPeriodMessage}
            </p>
          </div>
        )}

        {plan && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Included with {plan.name}
            </p>
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <AqCheck className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ReusableDialog>
  );
};

export default CheckoutDialog;
