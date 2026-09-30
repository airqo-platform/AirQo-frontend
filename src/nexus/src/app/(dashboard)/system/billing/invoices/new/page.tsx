'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState, PageHeading } from '@/shared/components/ui';
import { AqArrowLeft } from '@airqo/icons-react';
import Link from 'next/link';
import { InvoiceForm } from '@/modules/system-billing';

const NewInvoicePageInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCustomerId =
    searchParams?.get('customerId') ??
    searchParams?.get('customer_id') ??
    undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/system/billing/invoices"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <AqArrowLeft className="w-4 h-4" />
        Back to invoices
      </Link>

      <PageHeading
        title="New Invoice"
        subtitle="Create a draft invoice. You can finalize it later."
      />

      <InvoiceForm
        mode="create"
        initialCustomerId={initialCustomerId}
        onSaved={invoice => {
          router.push(`/system/billing/invoices/${invoice.id}`);
        }}
      />
    </div>
  );
};

const NewInvoicePage: React.FC = () => (
  <Suspense fallback={<LoadingState />}>
    <NewInvoicePageInner />
  </Suspense>
);

export default NewInvoicePage;
