'use client';

import React from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { AqCheck } from '@airqo/icons-react';
import type { SubscriptionPlan, SubscriptionTier } from '@/shared/types/api';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  currentTier: SubscriptionTier;
  loading?: boolean;
  onConfirm: () => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onClose,
  plan,
  currentTier,
  loading = false,
  onConfirm,
}) => {
  const billingCycleLabel = 'monthly';

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Continue To Secure Checkout"
      subtitle={
        plan
          ? `${plan.name} · $${plan.price}/${billingCycleLabel}`
          : 'Select a subscription plan'
      }
      primaryAction={{
        label: loading ? 'Redirecting...' : 'Proceed To Checkout',
        onClick: onConfirm,
        disabled: !plan || loading,
        loading,
      }}
      secondaryAction={{
        label: 'Back',
        onClick: onClose,
        disabled: loading,
      }}
      size="lg"
      ariaLabel="Secure checkout confirmation"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Payments are handled on our provider-hosted checkout page. No card
            number or CVV is collected in this application.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Current Plan
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentTier}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Upgrading To
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {plan?.name || '--'}
            </p>
          </div>
        </div>

        {plan && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Included with {plan.name}
            </p>
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <AqCheck className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">
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
