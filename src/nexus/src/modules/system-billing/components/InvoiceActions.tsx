'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui';
import {
  AqDownload01,
  AqEdit05,
  AqEye,
  AqMail01,
  AqReceipt,
  AqRefreshCw05,
  AqTrash01,
} from '@airqo/icons-react';
import { billingService } from '@/shared/services/billingService';
import type { BillingInvoice, BillingPayment } from '@/shared/types/billing';
import {
  downloadBlob,
  openBlobInNewTab,
  invoicePdfFilename,
  receiptPdfFilename,
} from '@/modules/system-billing/lib/blob';
import { useBillingMutate } from '@/modules/system-billing/lib/queries';
import { useBillingAction } from '@/modules/system-billing/lib/hooks';
import FinalizeInvoiceDialog from './FinalizeInvoiceDialog';
import SendInvoiceDialog from './SendInvoiceDialog';
import VoidDialog from './VoidDialog';
import RecordPaymentDialog from './RecordPaymentDialog';
import MarkSentDialog from './MarkSentDialog';

interface InvoiceActionsProps {
  invoice: BillingInvoice;
  onRefresh: () => void;
}

type DialogKey =
  | 'finalize'
  | 'send'
  | 'remind'
  | 'markSent'
  | 'void'
  | 'recordPayment';

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  onRefresh,
}) => {
  const router = useRouter();
  const revalidateAll = useBillingMutate();
  const { run, isBusy } = useBillingAction();
  const [openDialog, setOpenDialog] = useState<DialogKey | null>(null);
  const busy = isBusy();

  const status = invoice.status;
  const kind = invoice.kind;
  const payments = invoice.payments ?? [];
  const hasPayments = payments.length > 0;
  const latestPayment = hasPayments ? payments[0] : null;

  const refresh = useCallback(async () => {
    await revalidateAll();
    onRefresh();
  }, [revalidateAll, onRefresh]);

  const isDraft = status === 'draft';
  const isOpenStatus = status === 'open';
  const isPartiallyPaid = status === 'partially_paid';
  const isPaid = status === 'paid';
  const isConverted = status === 'converted';
  const isVoid = status === 'void';
  const isProforma = kind === 'proforma';

  const handleDownloadPdf = useCallback(
    () =>
      run(
        'download-pdf',
        () => billingService.getInvoicePdf(invoice.id, { download: true }),
        {
          onSuccess: blob => downloadBlob(blob, invoicePdfFilename(invoice)),
        }
      ),
    [invoice, run]
  );

  const handlePreviewPdf = useCallback(
    () =>
      run(
        'preview-pdf',
        () => billingService.getInvoicePdf(invoice.id, { download: false }),
        { onSuccess: blob => openBlobInNewTab(blob) }
      ),
    [invoice, run]
  );

  const handleDelete = useCallback(() => {
    if (!window.confirm('Delete this draft invoice? This cannot be undone.')) {
      return;
    }
    return run(
      'delete-invoice',
      () => billingService.deleteInvoice(invoice.id),
      {
        success: 'Invoice deleted',
        onSuccess: () => router.push('/system/billing/invoices'),
      }
    );
  }, [invoice.id, router, run]);

  const handleConvert = useCallback(
    () =>
      run('convert', () => billingService.convertInvoice(invoice.id), {
        success: 'Pro forma converted to invoice',
        onSuccess: refresh,
      }),
    [invoice.id, refresh, run]
  );

  const handleVoid = useCallback(
    async (reason: string) => {
      await run(
        'void',
        () => billingService.voidInvoice(invoice.id, { reason }),
        {
          success: 'Invoice voided',
          onSuccess: async () => {
            setOpenDialog(null);
            await refresh();
          },
        }
      );
    },
    [invoice.id, refresh, run]
  );

  const handleDownloadReceipt = useCallback(
    (payment: BillingPayment) =>
      run(
        'download-receipt',
        () => billingService.getReceiptPdf(payment.id, { download: true }),
        {
          onSuccess: blob => downloadBlob(blob, receiptPdfFilename(payment)),
        }
      ),
    [run]
  );

  const handleSendReceipt = useCallback(
    (payment: BillingPayment) =>
      run('send-receipt', () => billingService.sendReceipt(payment.id, {}), {
        success: 'Receipt sent',
      }),
    [run]
  );

  const closeDialog = useCallback(() => setOpenDialog(null), []);

  const primaryAction = useMemo(() => {
    if (isDraft) {
      return { label: 'Finalize', onClick: () => setOpenDialog('finalize') };
    }
    if ((isOpenStatus || isPartiallyPaid) && !isProforma) {
      return {
        label: 'Record payment',
        onClick: () => setOpenDialog('recordPayment'),
      };
    }
    return null;
  }, [isDraft, isOpenStatus, isPartiallyPaid, isProforma]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {primaryAction && (
          <Button onClick={primaryAction.onClick} disabled={busy}>
            {primaryAction.label}
          </Button>
        )}

        <Button
          variant="outlined"
          Icon={AqDownload01}
          iconPosition="start"
          onClick={handleDownloadPdf}
          disabled={busy}
        >
          PDF
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outlined" disabled={busy}>
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isDraft && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/system/billing/invoices/${invoice.id}/edit`)
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <AqEdit05 className="w-4 h-4" /> Edit
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePreviewPdf}>
                  <span className="inline-flex items-center gap-2">
                    <AqEye className="w-4 h-4" /> Preview PDF
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDialog('finalize')}>
                  <span className="inline-flex items-center gap-2">
                    <AqMail01 className="w-4 h-4" /> Finalize
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <span className="inline-flex items-center gap-2">
                    <AqTrash01 className="w-4 h-4" /> Delete
                  </span>
                </DropdownMenuItem>
              </>
            )}

            {(isOpenStatus || isPartiallyPaid) && !isProforma && (
              <>
                <DropdownMenuItem
                  onClick={() => setOpenDialog('recordPayment')}
                >
                  <span className="inline-flex items-center gap-2">
                    <AqReceipt className="w-4 h-4" /> Record payment
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDialog('send')}>
                  <span className="inline-flex items-center gap-2">
                    <AqMail01 className="w-4 h-4" /> Send
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDialog('remind')}>
                  <span className="inline-flex items-center gap-2">
                    <AqMail01 className="w-4 h-4" /> Remind
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDialog('markSent')}>
                  <span className="inline-flex items-center gap-2">
                    <AqRefreshCw05 className="w-4 h-4" /> Mark sent
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePreviewPdf}>
                  <span className="inline-flex items-center gap-2">
                    <AqEye className="w-4 h-4" /> Preview PDF
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpenDialog('void')}
                  disabled={hasPayments}
                  className={
                    hasPayments ? 'text-muted-foreground' : 'text-destructive'
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <AqTrash01 className="w-4 h-4" /> Void
                  </span>
                </DropdownMenuItem>
              </>
            )}

            {isProforma && !isConverted && !isVoid && !isDraft && (
              <>
                {isOpenStatus && (
                  <DropdownMenuItem onClick={handleConvert}>
                    <span className="inline-flex items-center gap-2">
                      <AqRefreshCw05 className="w-4 h-4" /> Convert to invoice
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setOpenDialog('send')}>
                  <span className="inline-flex items-center gap-2">
                    <AqMail01 className="w-4 h-4" /> Send
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePreviewPdf}>
                  <span className="inline-flex items-center gap-2">
                    <AqEye className="w-4 h-4" /> Preview PDF
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpenDialog('void')}
                  disabled={hasPayments}
                  className={
                    hasPayments ? 'text-muted-foreground' : 'text-destructive'
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <AqTrash01 className="w-4 h-4" /> Void
                  </span>
                </DropdownMenuItem>
              </>
            )}

            {isPaid && !isProforma && latestPayment && (
              <>
                <DropdownMenuItem
                  onClick={() => handleDownloadReceipt(latestPayment)}
                >
                  <span className="inline-flex items-center gap-2">
                    <AqDownload01 className="w-4 h-4" /> Download receipt
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSendReceipt(latestPayment)}
                >
                  <span className="inline-flex items-center gap-2">
                    <AqMail01 className="w-4 h-4" /> Send receipt
                  </span>
                </DropdownMenuItem>
              </>
            )}

            {(isConverted || isVoid) && (
              <DropdownMenuItem onClick={handlePreviewPdf}>
                <span className="inline-flex items-center gap-2">
                  <AqEye className="w-4 h-4" /> Preview PDF
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasPayments && (
        <p className="text-xs text-muted-foreground mt-1">
          Void disabled because payments exist.
        </p>
      )}

      <FinalizeInvoiceDialog
        isOpen={openDialog === 'finalize'}
        onClose={closeDialog}
        invoice={invoice}
        onSuccess={refresh}
      />
      <SendInvoiceDialog
        isOpen={openDialog === 'send'}
        onClose={closeDialog}
        invoice={invoice}
        mode="send"
        onSuccess={refresh}
      />
      <SendInvoiceDialog
        isOpen={openDialog === 'remind'}
        onClose={closeDialog}
        invoice={invoice}
        mode="remind"
        onSuccess={refresh}
      />
      <MarkSentDialog
        isOpen={openDialog === 'markSent'}
        onClose={closeDialog}
        invoice={invoice}
        onSuccess={refresh}
      />
      <RecordPaymentDialog
        isOpen={openDialog === 'recordPayment'}
        onClose={closeDialog}
        invoice={invoice}
        onSuccess={refresh}
      />
      <VoidDialog
        isOpen={openDialog === 'void'}
        onClose={closeDialog}
        title="Void Invoice"
        description={
          hasPayments
            ? 'Cannot void an invoice with recorded payments. Void the payments first.'
            : 'Voiding this invoice is irreversible. It will be marked as void and no further payments can be recorded.'
        }
        confirmLabel="Void invoice"
        onConfirm={handleVoid}
        loading={false}
      />
    </>
  );
};

export default InvoiceActions;
