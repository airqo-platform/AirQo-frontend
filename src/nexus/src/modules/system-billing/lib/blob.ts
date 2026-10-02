import type { BillingInvoice, BillingPayment } from '@/shared/types/billing';
import { resolveInvoiceNumber } from './format';

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const openBlobInNewTab = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  // The tab owns the URL now; revoke after load. A short delay avoids
  // revoking before the new tab fetches on slow connections.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const invoicePdfFilename = (invoice: BillingInvoice): string => {
  const number = resolveInvoiceNumber(invoice);
  const safe = number.replace(/[^a-zA-Z0-9-_]/g, '_') || 'invoice';
  return `${safe}.pdf`;
};

export const receiptPdfFilename = (payment: BillingPayment): string => {
  const number =
    payment.receipt_number ?? payment.reference ?? payment.id ?? 'receipt';
  const safe = String(number).replace(/[^a-zA-Z0-9-_]/g, '_') || 'receipt';
  return `${safe}.pdf`;
};
