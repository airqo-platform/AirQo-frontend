'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { Input } from '@/shared/components/ui';
import { AqPlus, AqXClose } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { BillingCustomer } from '@/shared/types/billing';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import { useBillingQuery } from '@/modules/system-billing/lib/hooks';

interface CustomerPickerProps {
  value: string;
  onChange: (customerId: string) => void;
  disabled?: boolean;
  error?: string;
}

const CustomerPicker: React.FC<CustomerPickerProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: 'active' as const,
      limit: 20,
      skip: 0,
    }),
    [debouncedSearch]
  );

  const { data, isLoading } = useBillingQuery(
    isOpen ? billingKeys.customers(params) : null,
    signal => billingFetchers.listCustomers(signal, params)
  );

  // The list query is disabled while the popover is closed, so the selected
  // customer is resolved by id as well — otherwise the name is lost on close,
  // on first render with a pre-filled id, and for archived customers (the
  // search is scoped to active ones).
  const { data: selectedCustomerData } = useBillingQuery(
    value ? billingKeys.customer(value) : null,
    signal => billingFetchers.getCustomer(signal, value)
  );

  const customers = useMemo(() => data?.items ?? [], [data]);

  const selectedCustomer = useMemo(
    () => customers.find(c => c.id === value) ?? selectedCustomerData,
    [customers, value, selectedCustomerData]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (customer: BillingCustomer) => {
      onChange(customer.id);
      setIsOpen(false);
      setSearchInput('');
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    setSearchInput('');
  }, [onChange]);

  const displayValue = isOpen
    ? searchInput
    : (selectedCustomer?.name ?? (value ? value : ''));

  const showClear = !isOpen && value;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <label
            htmlFor="customer-picker-input"
            className="flex items-center mb-2 text-sm text-foreground"
          >
            Customer
          </label>
          <div className="relative">
            <Input
              id="customer-picker-input"
              placeholder="Search for a customer…"
              value={displayValue}
              onChange={e => {
                setSearchInput(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              error={error}
              aria-label="Customer"
            />
            {showClear && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear customer selection"
              >
                <AqXClose className="w-4 h-4" />
              </button>
            )}
          </div>
          {selectedCustomer && !isOpen && !error && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              Billing:{' '}
              {Array.isArray(selectedCustomer.billing_emails)
                ? selectedCustomer.billing_emails.join(', ') || 'none'
                : 'none'}
            </div>
          )}
        </div>
        <Tooltip content="Create new customer">
          <Link
            href="/system/billing/customers"
            className="inline-flex items-center justify-center h-[42px] w-[42px] rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Create new customer"
          >
            <AqPlus className="w-4 h-4" />
          </Link>
        </Tooltip>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:min-w-[320px] z-50 mt-1 bg-card border border-input rounded-md shadow-lg max-h-64 overflow-y-auto">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching…
            </div>
          )}
          {!isLoading && customers.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {debouncedSearch
                ? `No customers match "${debouncedSearch}".`
                : 'No active customers found.'}
            </div>
          )}
          {customers.map(customer => (
            <button
              type="button"
              key={customer.id}
              onClick={() => handleSelect(customer)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                customer.id === value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground'
              }`}
            >
              <span className="block font-medium">{customer.name ?? '—'}</span>
              {Array.isArray(customer.billing_emails) &&
                customer.billing_emails.length > 0 && (
                  <span className="block text-xs text-muted-foreground truncate">
                    {customer.billing_emails.join(', ')}
                  </span>
                )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerPicker;
