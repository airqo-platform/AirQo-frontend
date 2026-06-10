'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';

const BillingInformation: React.FC = () => {
  return (
    <SettingsLayout
      title="Billing Information"
      description="Manage billing profile details and payment methods once backend support is enabled."
    >
      <Card className="p-6 border-dashed">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Billing Profile Management Is Coming Soon
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The current backend API supports subscription tier management,
          checkout, renewal, cancellation, and transaction history. Billing
          address and direct payment-method updates will be enabled once the
          corresponding backend endpoints are available.
        </p>
      </Card>
    </SettingsLayout>
  );
};

export default BillingInformation;
