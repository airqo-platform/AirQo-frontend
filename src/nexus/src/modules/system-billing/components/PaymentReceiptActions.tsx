'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui';
import { Tooltip } from 'flowbite-react';
import { AqDownload01, AqMail01, AqTrash01 } from '@airqo/icons-react';
import { billingService } from '@/shared/services/billingService';
import type { BillingPayment } from '@/shared/types/billing';
import { downloadBlob, receiptPdfFilename } from '../lib/blob';
import { useBillingAction } from '../lib/hooks';
import SendReceiptDialog from './SendReceiptDialog';
import VoidDialog from './VoidDialog';

interface PaymentReceiptActionsProps {
  payment: BillingPayment;
  onChanged?: () => unknown | Promise<unknown>;
}

/**
 * Receipt actions (download PDF, send by email, void) for a single payment.
 * Shared by the payments list and the invoice detail payments table, so the
 * single-flight guard, toasts and revalidation live in one place.
 */
const PaymentReceiptActions: React.FC<PaymentReceiptActionsProps> = ({
  payment,
  onChanged,
}) => {
  const [isSendOpen, setSendOpen] = useState(false);
  const [isVoidOpen, setVoidOpen] = useState(false);
  const { run, isBusy } = useBillingAction();

  const label = payment.receipt_number ?? payment.id;

  const handleDownload = async () => {
    await run(
      'download-receipt',
      () => billingService.getReceiptPdf(payment.id, { download: true }),
      {
        onSuccess: blob => downloadBlob(blob, receiptPdfFilename(payment)),
      }
    );
  };

  const handleVoid = async (reason: string) => {
    await run(
      'void-payment',
      () => billingService.voidPayment(payment.id, { reason }),
      {
        success: 'Payment voided',
        onSuccess: async () => {
          setVoidOpen(false);
          await onChanged?.();
        },
      }
    );
  };

  return (
    <>
      <div className="flex gap-1">
        <Tooltip content="Download receipt">
          <Button
            size="sm"
            variant="ghost"
            className="p-1 h-8 w-8"
            aria-label={`Download receipt ${label}`}
            onClick={handleDownload}
            loading={isBusy('download-receipt')}
            disabled={isBusy()}
          >
            <AqDownload01 className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Send receipt">
          <Button
            size="sm"
            variant="ghost"
            className="p-1 h-8 w-8"
            aria-label={`Send receipt ${label}`}
            onClick={() => setSendOpen(true)}
            disabled={isBusy()}
          >
            <AqMail01 className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Void payment">
          <Button
            size="sm"
            variant="ghost"
            className="p-1 h-8 w-8"
            aria-label={`Void payment ${label}`}
            onClick={() => setVoidOpen(true)}
            disabled={isBusy()}
          >
            <AqTrash01 className="w-4 h-4 text-destructive" />
          </Button>
        </Tooltip>
      </div>

      <SendReceiptDialog
        isOpen={isSendOpen}
        payment={payment}
        onClose={() => setSendOpen(false)}
        onSent={onChanged}
      />

      <VoidDialog
        isOpen={isVoidOpen}
        onClose={() => setVoidOpen(false)}
        title="Void Payment"
        description="Voiding this payment restores the invoice's balance and status. This cannot be undone."
        confirmLabel="Void payment"
        onConfirm={handleVoid}
      />
    </>
  );
};

export default PaymentReceiptActions;
