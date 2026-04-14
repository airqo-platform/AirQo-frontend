'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';
import Dialog from '@/shared/components/ui/dialog';

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingMethod?: {
    last4: string;
    brand?: string;
    expiryMonth?: string;
    expiryYear?: string;
  };
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingMethod,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={existingMethod ? 'Update Payment Method' : 'Add Payment Method'}
      size="lg"
      showFooter={false}
      ariaLabel="Payment method availability"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Direct payment method updates are not currently available from the
          backend API.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Use the Subscription tab to continue through secure hosted checkout
          whenever you need to change tiers or renew a plan.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => {
              onSuccess();
              onClose();
            }}
          >
            Close
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default PaymentMethodForm;
