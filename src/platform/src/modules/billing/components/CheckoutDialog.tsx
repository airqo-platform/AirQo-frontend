'use client';

import React, { useState } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import type { SubscriptionPlan } from '@/shared/types/api';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!plan) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would call a payment gateway
      // For now, just show success
      toast.success(`Successfully upgraded to ${plan.name}!`);

      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');

      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      subtitle={plan ? `Upgrade to ${plan.name} - $${plan.price}/monthly` : ''}
      primaryAction={{
        label: isProcessing ? 'Processing...' : 'Complete Payment',
        onClick: handleSubmit,
        disabled:
          isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <div className="space-y-4">
        <Input
          label="Cardholder Name"
          value={cardholderName}
          onChange={e => setCardholderName(e.target.value)}
          placeholder="John Doe"
          required
          disabled={isProcessing}
        />

        <Input
          label="Card Number"
          value={cardNumber}
          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          required
          disabled={isProcessing}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expiry Date"
            value={expiryDate}
            onChange={e => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            required
            disabled={isProcessing}
          />

          <Input
            label="CVV"
            type="password"
            value={cvv}
            onChange={e =>
              setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
            }
            placeholder="123"
            maxLength={4}
            required
            disabled={isProcessing}
          />
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p className="font-medium mb-2">Payment Summary</p>
          <div className="flex justify-between">
            <span>{plan?.name}</span>
            <span>${plan?.price} monthly</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${plan?.price} monthly</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Your payment information is secure and encrypted. We comply with PCI
          DSS standards.
        </div>
      </div>
    </ReusableDialog>
  );
};

export default CheckoutDialog;
