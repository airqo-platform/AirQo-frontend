'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Input, TextInput } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { SegmentedTabs } from '@/shared/components/ui';
import { billingService } from '@/shared/services/billingService';
import type { BillingCustomer } from '@/shared/types/billing';
import { getBillingErrorMessage } from '../lib/errors';

interface CustomerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: BillingCustomer | null;
}

type CustomerStatus = 'active' | 'archived';

const EMAIL_SPLIT_REGEX = /[,\n;]+/;

const parseEmails = (value: string): string[] =>
  value
    .split(EMAIL_SPLIT_REGEX)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

const formatEmails = (emails: string[]): string => emails.join(', ');

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const isEdit = Boolean(customer);

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [billingEmails, setBillingEmails] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLines, setAddressLines] = useState('');
  const [country, setCountry] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currency, setCurrency] = useState('');
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(customer?.name ?? '');
    setContactName(customer?.contact_name ?? '');
    setBillingEmails(
      Array.isArray(customer?.billing_emails)
        ? formatEmails(customer.billing_emails)
        : ''
    );
    setPhone(customer?.phone ?? '');
    setAddressLines(
      Array.isArray(customer?.address_lines)
        ? customer.address_lines.join('\n')
        : ''
    );
    setCountry(customer?.country ?? '');
    setTaxId(customer?.tax_id ?? '');
    setCurrency(customer?.currency ?? '');
    setGroupId(customer?.group_id ?? '');
    setStatus(customer?.status === 'archived' ? 'archived' : 'active');
    setError(null);
  }, [isOpen, customer]);

  const handleSubmit = async () => {
    if (!name.trim() && !groupId.trim()) {
      setError('Provide a customer name or an organization id.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        billing_emails: parseEmails(billingEmails),
        phone: phone.trim() || undefined,
        address_lines: addressLines
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean),
        country: country.trim() || undefined,
        tax_id: taxId.trim() || undefined,
        currency: currency.trim() || undefined,
        group_id: groupId.trim() || undefined,
        ...(isEdit ? { status } : {}),
      };

      if (isEdit && customer) {
        await billingService.updateCustomer(customer.id, payload);
        toast.success('Customer updated successfully');
      } else {
        await billingService.createCustomer(payload);
        toast.success('Customer created successfully');
      }
      onSuccess();
    } catch (err) {
      const message = getBillingErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Customer' : 'New Customer'}
      size="lg"
      primaryAction={{
        label: isEdit ? 'Save changes' : 'Create customer',
        onClick: handleSubmit,
        disabled: isSubmitting,
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isSubmitting,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Customer name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Acme Corp"
            description="Required unless an organization id is provided."
          />
          <Input
            label="Contact name"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>

        <Input
          label="Billing emails"
          value={billingEmails}
          onChange={e => setBillingEmails(e.target.value)}
          placeholder="billing@acme.com, accounts@acme.com"
          description="Comma- or newline-separated. Used for invoice delivery."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 555 0100"
          />
          <Input
            label="Country"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="Kenya"
          />
        </div>

        <TextInput
          label="Address lines"
          value={addressLines}
          onChange={e => setAddressLines(e.target.value)}
          placeholder={'123 Main Street\nSuite 4\nNairobi'}
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Tax ID"
            value={taxId}
            onChange={e => setTaxId(e.target.value)}
            placeholder="KE123456789"
          />
          <Input
            label="Currency"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            placeholder="USD"
          />
          <Input
            label="Organization ID"
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            placeholder="Group / org id"
            description="Links the customer to an organization. Org picker is a follow-up."
          />
        </div>

        {isEdit && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Status</p>
            <SegmentedTabs<CustomerStatus>
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
              value={status}
              onChange={setStatus}
              ariaLabel="Customer status"
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default CustomerFormDialog;
