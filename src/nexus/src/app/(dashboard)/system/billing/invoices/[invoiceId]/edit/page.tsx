'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/shared/components/ui';
import { AqArrowLeft } from '@airqo/icons-react';
import { ErrorState } from '@/shared/components/ui';
import { WarningBanner } from '@/shared/components/ui';
import { InvoiceForm } from '@/modules/system-billing';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import { useBillingQuery } from '@/modules/system-billing/lib/hooks';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';
import { toast } from '@/shared/components/ui/toast';

const EditInvoicePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params?.invoiceId ?? '');

  const {
    data: invoice,
    error: invoiceError,
    isLoading: invoiceLoading,
    mutate,
  } = useBillingQuery(billingKeys.invoice(invoiceId), signal =>
    billingFetchers.getInvoice(signal, invoiceId)
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const isNonDraft = invoice && invoice.status && invoice.status !== 'draft';

  if (invoiceLoading) {
    return (
      <div className="space-y-6">
        <LoadingState text="Loading invoice..." />
      </div>
    );
  }

  if (invoiceError) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Failed to load invoice"
          description={getBillingErrorMessage(invoiceError)}
          retryAction={{ label: 'Retry', onClick: refresh }}
        />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <ErrorState title="Invoice not found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/system/billing/invoices/${invoiceId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <AqArrowLeft className="w-4 h-4" />
        Back to invoice
      </Link>

      {isNonDraft && (
        <WarningBanner
          title="Only draft invoices can be edited"
          message={`This invoice is ${invoice.status}. To make changes, you would need to void it and create a new one.`}
          actions={
            <Link
              href={`/system/billing/invoices/${invoiceId}`}
              className="text-sm font-medium underline"
            >
              Back to invoice
            </Link>
          }
        />
      )}

      {invoice.status === 'draft' && (
        <InvoiceForm
          mode="edit"
          invoice={invoice}
          onSaved={updated => {
            toast.success('Invoice updated');
            router.push(`/system/billing/invoices/${updated.id}`);
          }}
        />
      )}
    </div>
  );
};

export default EditInvoicePage;
