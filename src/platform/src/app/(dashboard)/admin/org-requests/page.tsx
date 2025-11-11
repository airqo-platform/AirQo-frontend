'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/ui/error-state';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import ReusableDialog from '@/shared/components/ui/dialog';
import PageHeading from '@/shared/components/ui/page-heading';
import { TextInput } from '@/shared/components/ui/text-input';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  useOrganizationRequests,
  useApproveOrganizationRequest,
  useRejectOrganizationRequest,
} from '@/shared/hooks';
import { toast } from '@/shared/components/ui/toast';

interface FilterOption {
  label: string;
  value: string | number | boolean;
}

interface TableColumn<T = unknown> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: FilterOption[];
  filterMulti?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

type TabType = 'pending' | 'approved' | 'rejected';

interface OrganizationRequest {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  onboarding_completed: boolean;
  onboarding_method: string;
  organization_name: string;
  organization_slug: string;
  contact_email: string;
  contact_name: string;
  use_case: string;
  organization_type: string;
  country: string;
  branding_settings: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  approved_by: string | null;
  rejection_reason?: string;
}

const OrganizationRequestsPage = () => {
  const { data, error, isLoading, mutate } = useOrganizationRequests();

  const requests = useMemo(() => data?.requests || [], [data?.requests]);
  const errorMessage = error ? 'Failed to load organization requests' : null;

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'reject';
    id: string;
    reason?: string;
  } | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedReasons, setExpandedReasons] = useState<
    Record<string, boolean>
  >({});

  // Pagination and search states for ServerSideTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const approveMutation = useApproveOrganizationRequest();
  const rejectMutation = useRejectOrganizationRequest();

  const filteredRequests = useMemo(() => {
    let filtered = requests.filter(request => request.status === activeTab);

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        request =>
          request.organization_name.toLowerCase().includes(searchLower) ||
          request.contact_name.toLowerCase().includes(searchLower) ||
          request.contact_email.toLowerCase().includes(searchLower) ||
          request.organization_slug.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [requests, activeTab, searchTerm]);

  // Paginate the filtered results
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRequests.slice(start, end);
  }, [filteredRequests, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  const tableData = useMemo(
    () => paginatedRequests.map(req => ({ ...req, id: req._id })),
    [paginatedRequests]
  );

  const currentRequest = useMemo(() => {
    return confirmDialog
      ? requests.find(r => r._id === confirmDialog.id)
      : null;
  }, [confirmDialog, requests]);

  const handleRefresh = () => {
    mutate();
  };

  const handleApprove = useCallback((requestId: string) => {
    setConfirmDialog({ type: 'approve', id: requestId });
  }, []);

  const handleReject = useCallback((requestId: string) => {
    setConfirmDialog({ type: 'reject', id: requestId });
  }, []);

  const handleConfirmApprove = useCallback(async () => {
    if (!confirmDialog) return;
    try {
      await approveMutation.trigger({ requestId: confirmDialog.id });
      toast.success('Organization request approved successfully');
      setConfirmDialog(null);
      mutate();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Approve error:', error);
    }
  }, [approveMutation, confirmDialog, mutate]);

  const handleConfirmReject = useCallback(async () => {
    if (!confirmDialog) return;
    try {
      await rejectMutation.trigger({
        requestId: confirmDialog.id,
        rejection_reason: confirmDialog.reason || '',
      });
      toast.success('Organization request rejected successfully');
      setConfirmDialog(null);
      mutate();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Reject error:', error);
    }
  }, [rejectMutation, confirmDialog, mutate]);

  const columns: TableColumn<OrganizationRequest>[] = useMemo(
    () => [
      {
        key: 'organization_name',
        label: 'Organization',
        render: (value: unknown, item: OrganizationRequest) => {
          const isExpanded = expandedItems.has(item._id);
          const truncatedUseCase =
            item.use_case.length > 50
              ? item.use_case.substring(0, 50) + '...'
              : item.use_case;
          return (
            <div>
              <div>{item.organization_name}</div>
              <div className="text-sm text-gray-500">
                {item.organization_slug}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isExpanded ? item.use_case : truncatedUseCase}
                {item.use_case.length > 50 && (
                  <button
                    className="text-blue-500 ml-1 text-xs"
                    onClick={() => {
                      setExpandedItems(prev => {
                        const newSet = new Set(prev);
                        if (isExpanded) {
                          newSet.delete(item._id);
                        } else {
                          newSet.add(item._id);
                        }
                        return newSet;
                      });
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'contact_name',
        label: 'Contact',
        render: (value: unknown, item: OrganizationRequest) => (
          <div>
            <div>{item.contact_name}</div>
            <div className="text-sm text-gray-500">{item.contact_email}</div>
          </div>
        ),
      },
      {
        key: 'organization_type',
        label: 'Type',
        render: (value: unknown) => (
          <span className="capitalize">{value as string}</span>
        ),
      },
      {
        key: 'country',
        label: 'Country',
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: unknown) =>
          formatWithPattern(value as string, 'MMM dd, yyyy'),
      },
      ...(activeTab === 'pending'
        ? [
            {
              key: 'actions',
              label: 'Actions',
              render: (value: unknown, item: OrganizationRequest) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="filled"
                    onClick={() => handleApprove(item._id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => handleReject(item._id)}
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]
        : []),
      ...(activeTab === 'rejected'
        ? [
            {
              key: 'rejection_reason',
              label: 'Rejection Reason',
              render: (value: unknown, item: OrganizationRequest) => {
                const reason = item.rejection_reason || '';
                const isExpanded = expandedReasons[item._id];
                const shouldTruncate = reason.length > 100;
                const displayText =
                  shouldTruncate && !isExpanded
                    ? reason.substring(0, 100) + '...'
                    : reason;
                return (
                  <div>
                    <div>{displayText}</div>
                    {shouldTruncate && (
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() =>
                          setExpandedReasons(prev => ({
                            ...prev,
                            [item._id]: !prev[item._id],
                          }))
                        }
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </Button>
                    )}
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [activeTab, handleApprove, handleReject, expandedItems, expandedReasons]
  );

  if (errorMessage) {
    return (
      <ErrorState
        title="Failed to load organization requests"
        description={errorMessage}
        retryAction={{
          label: 'Try again',
          onClick: handleRefresh,
        }}
      />
    );
  }

  return (
    <div className="container mx-auto">
      <PageHeading
        title="Organization Requests"
        subtitle="Manage organization registration requests"
      />

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'pending' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </Button>
          <Button
            variant={activeTab === 'approved' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({requests.filter(r => r.status === 'approved').length})
          </Button>
          <Button
            variant={activeTab === 'rejected' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({requests.filter(r => r.status === 'rejected').length})
          </Button>
        </div>

        {/* Table */}
        <ServerSideTable
          title="Requests"
          data={tableData}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredRequests.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Confirmation Dialog */}
      <ReusableDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        title={
          confirmDialog?.type === 'approve'
            ? 'Confirm Approval'
            : 'Confirm Rejection'
        }
        subtitle=""
        primaryAction={{
          label: confirmDialog?.type === 'approve' ? 'Approve' : 'Reject',
          onClick:
            confirmDialog?.type === 'approve'
              ? handleConfirmApprove
              : handleConfirmReject,
          disabled:
            approveMutation.isMutating ||
            rejectMutation.isMutating ||
            (confirmDialog?.type === 'reject' && !confirmDialog.reason?.trim()),
          loading:
            confirmDialog?.type === 'approve'
              ? approveMutation.isMutating
              : rejectMutation.isMutating,
          className:
            confirmDialog?.type === 'reject'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : undefined,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setConfirmDialog(null),
        }}
      >
        <p>
          Are you sure you want to {confirmDialog?.type} the request from{' '}
          {currentRequest?.organization_name}?
        </p>
        {confirmDialog?.type === 'reject' && (
          <TextInput
            label="Rejection Reason"
            value={confirmDialog.reason || ''}
            onChange={e =>
              setConfirmDialog({ ...confirmDialog, reason: e.target.value })
            }
            required
            placeholder="Please provide a reason for rejection"
          />
        )}
      </ReusableDialog>
    </div>
  );
};

export default OrganizationRequestsPage;
