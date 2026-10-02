'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  SegmentedTabs,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { SearchField } from '@/shared/components/ui';
import {
  AqEye,
  AqEdit05,
  AqPlus,
  AqRefreshCw05,
  AqArchive,
  AqShieldTick,
  AqUsers01,
} from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import Dialog from '@/shared/components/ui/dialog';
import { billingService } from '@/shared/services/billingService';
import type { BillingCustomer } from '@/shared/types/billing';
import {
  BillingFilterBar,
  CustomerStatusBadge,
  CurrencyAmount,
  CustomerFormDialog,
  FilterGroup,
} from '@/modules/system-billing';
import {
  CUSTOMER_PAGE_SIZE_OPTIONS,
  DEFAULT_LIST_LIMIT,
} from '@/modules/system-billing/constants';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import {
  toPaginationProps,
  useBillingAction,
  useBillingList,
  useBillingQuery,
} from '@/modules/system-billing/lib/hooks';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';

type StatusFilter = 'all' | 'active' | 'archived';
type CustomerFilters = { status?: Exclude<StatusFilter, 'all'> };

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const CustomersPage: React.FC = () => {
  const router = useRouter();
  const list = useBillingList<CustomerFilters>({
    defaultFilters: {},
    defaultLimit: DEFAULT_LIST_LIMIT,
  });
  const { run, isBusy } = useBillingAction();
  const statusFilter: StatusFilter = list.filters.status ?? 'all';

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<BillingCustomer | null>(null);

  const [archiveDialog, setArchiveDialog] = useState<{
    isOpen: boolean;
    customer: BillingCustomer | null;
    archive: boolean;
  }>({ isOpen: false, customer: null, archive: true });

  const params = list.params;
  const {
    data: customersResponse,
    error: customersError,
    isLoading: customersLoading,
    isValidating,
    mutate,
  } = useBillingQuery(billingKeys.customers(params), signal =>
    billingFetchers.listCustomers(signal, params)
  );

  const customers = customersResponse?.items ?? [];
  const pagination = toPaginationProps(customersResponse?.meta, list);
  const isArchiving = isBusy('archive');

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const handleArchiveToggle = useCallback((customer: BillingCustomer) => {
    setArchiveDialog({
      isOpen: true,
      customer,
      archive: customer.status !== 'archived',
    });
  }, []);

  const handleConfirmArchive = useCallback(async () => {
    const { customer, archive } = archiveDialog;
    if (!customer) return;

    await run(
      'archive',
      () =>
        billingService.updateCustomer(customer.id, {
          status: archive ? 'archived' : 'active',
        }),
      {
        success: archive ? 'Customer archived' : 'Customer reactivated',
        onSuccess: () =>
          setArchiveDialog({ isOpen: false, customer: null, archive: true }),
        onError: () => undefined,
      }
    );
  }, [archiveDialog, run]);

  const openCreate = useCallback(() => {
    setEditingCustomer(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((customer: BillingCustomer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        render: (_value: unknown, item: BillingCustomer) => (
          <button
            onClick={() => router.push(`/system/billing/customers/${item.id}`)}
            className="text-left hover:text-primary hover:underline font-medium"
          >
            {item.name ?? '—'}
          </button>
        ),
      },
      {
        key: 'contact',
        label: 'Contact',
        render: (_value: unknown, item: BillingCustomer) => (
          <span className="break-all">{item.contact_name ?? '—'}</span>
        ),
      },
      {
        key: 'billing_emails',
        label: 'Emails',
        render: (_value: unknown, item: BillingCustomer) => (
          <span className="break-all text-sm text-muted-foreground">
            {Array.isArray(item.billing_emails)
              ? item.billing_emails.join(', ')
              : '—'}
          </span>
        ),
      },
      {
        key: 'country',
        label: 'Country',
        render: (_value: unknown, item: BillingCustomer) => item.country ?? '—',
      },
      {
        key: 'invoice_count',
        label: 'Invoices',
        render: (_value: unknown, item: BillingCustomer) =>
          item.invoice_count ?? 0,
      },
      {
        key: 'outstanding_balance',
        label: 'Outstanding',
        render: (_value: unknown, item: BillingCustomer) => (
          <CurrencyAmount
            amount={
              typeof item.outstanding_balance === 'number'
                ? item.outstanding_balance
                : undefined
            }
            currency={item.currency}
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (_value: unknown, item: BillingCustomer) => (
          <CustomerStatusBadge status={item.status} />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        render: (_value: unknown, item: BillingCustomer) => (
          <div className="flex gap-1">
            <Tooltip content="View customer">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  router.push(`/system/billing/customers/${item.id}`)
                }
                className="p-1 h-8 w-8"
                aria-label={`View customer ${item.name}`}
              >
                <AqEye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Edit customer">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(item)}
                className="p-1 h-8 w-8"
                aria-label={`Edit customer ${item.name}`}
              >
                <AqEdit05 className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip
              content={item.status === 'archived' ? 'Reactivate' : 'Archive'}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleArchiveToggle(item)}
                disabled={isArchiving}
                className="p-1 h-8 w-8"
                aria-label={
                  item.status === 'archived'
                    ? `Reactivate customer ${item.name}`
                    : `Archive customer ${item.name}`
                }
              >
                {item.status === 'archived' ? (
                  <AqShieldTick className="w-4 h-4 text-green-600" />
                ) : (
                  <AqArchive className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [router, openEdit, handleArchiveToggle, isArchiving]
  );

  const pageAction = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outlined"
        Icon={AqRefreshCw05}
        iconPosition="start"
        onClick={handleRefresh}
        loading={isValidating}
      >
        Refresh
      </Button>
      <Button Icon={AqPlus} iconPosition="start" onClick={openCreate}>
        New customer
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Customers"
        subtitle="Manage the customers you invoice and track their outstanding balances."
        action={pageAction}
      />

      <BillingFilterBar
        fields={[
          {
            label: 'Search',
            children: (
              <SearchField
                placeholder="Search customers…"
                value={list.searchInput}
                onChange={event => list.setSearchInput(event.target.value)}
                onClear={() => list.setSearchInput('')}
              />
            ),
          },
        ]}
        groups={
          <FilterGroup label="Status">
            <SegmentedTabs
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={value =>
                list.setFilter(
                  'status',
                  value === 'all'
                    ? undefined
                    : (value as CustomerFilters['status'])
                )
              }
              ariaLabel="Filter customers by status"
            />
          </FilterGroup>
        }
      />

      {customersError ? (
        <ErrorState
          title="Could not load customers"
          description={getBillingErrorMessage(customersError)}
          retryAction={{ label: 'Try again', onClick: handleRefresh }}
        />
      ) : customersLoading ? (
        <LoadingState text="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<AqUsers01 />}
          title="No customers found"
          description="Create your first customer to start invoicing."
          action={{ label: 'New customer', onClick: openCreate }}
        />
      ) : (
        <ServerSideTable
          data={customers as unknown as { id: string }[]}
          columns={columns}
          searchable={false}
          pageSizeOptions={CUSTOMER_PAGE_SIZE_OPTIONS}
          {...pagination}
        />
      )}

      <CustomerFormDialog
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditingCustomer(null);
          mutate();
        }}
        customer={editingCustomer}
      />

      <Dialog
        isOpen={archiveDialog.isOpen}
        onClose={() =>
          setArchiveDialog({ isOpen: false, customer: null, archive: true })
        }
        title={
          archiveDialog.archive ? 'Archive Customer' : 'Reactivate Customer'
        }
        size="md"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to{' '}
            {archiveDialog.archive ? 'archive' : 'reactivate'}{' '}
            <span className="font-semibold">
              {archiveDialog.customer?.name ?? 'this customer'}
            </span>
            ?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outlined"
              onClick={() =>
                setArchiveDialog({
                  isOpen: false,
                  customer: null,
                  archive: true,
                })
              }
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={handleConfirmArchive}
              loading={isArchiving}
            >
              {archiveDialog.archive ? 'Archive' : 'Reactivate'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
