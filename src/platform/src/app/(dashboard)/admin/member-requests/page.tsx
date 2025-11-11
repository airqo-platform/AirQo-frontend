'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { Button } from '@/shared/components/ui/button';
import PageHeading from '@/shared/components/ui/page-heading';
import ReusableDialog from '@/shared/components/ui/dialog';
import { useUser } from '@/shared/hooks/useUser';
import {
  useGroupJoinRequests,
  useApproveGroupJoinRequest,
  useRejectGroupJoinRequest,
} from '@/shared/hooks/useGroups';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { AqCheckCircle } from '@airqo/icons-react';
import { toast } from '@/shared/components/ui/toast';
import type { GroupJoinRequest } from '@/shared/types/api';

const MemberRequestsPage: React.FC = () => {
  const { activeGroup } = useUser();

  // Utility function to format group name
  const formatGroupName = (name: string | undefined): string => {
    if (!name) return 'THE GROUP';
    return name
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .toUpperCase(); // Convert to uppercase
  };

  // Pagination and search states for ServerSideTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'reject';
    requestId: string;
    userName: string;
  } | null>(null);

  // Get member requests
  const {
    data: requestsData,
    isLoading,
    error,
  } = useGroupJoinRequests(activeGroup?.id || null);

  const approveMutation = useApproveGroupJoinRequest();
  const rejectMutation = useRejectGroupJoinRequest();

  const requests = useMemo(
    () => requestsData?.requests || [],
    [requestsData?.requests]
  );

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;

    const searchLower = searchTerm.toLowerCase();
    return requests.filter(
      request =>
        request.email.toLowerCase().includes(searchLower) ||
        `${request.user?.firstName} ${request.user?.lastName}`
          .toLowerCase()
          .includes(searchLower) ||
        request.status.toLowerCase().includes(searchLower)
    );
  }, [requests, searchTerm]);

  // Paginate the filtered results
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRequests.slice(start, end);
  }, [filteredRequests, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  // Table data with id for ServerSideTable
  const tableData = useMemo(
    () => paginatedRequests.map(req => ({ ...req, id: req._id })),
    [paginatedRequests]
  );

  // Table columns for member requests will be defined after the handlers

  const handleApprove = useCallback((requestId: string, userName: string) => {
    setConfirmDialog({ type: 'approve', requestId, userName });
  }, []);

  const handleReject = useCallback((requestId: string, userName: string) => {
    setConfirmDialog({ type: 'reject', requestId, userName });
  }, []);

  const handleConfirmApprove = useCallback(async () => {
    if (!confirmDialog) return;

    try {
      await approveMutation.trigger({ requestId: confirmDialog.requestId });
      toast.success('Request approved successfully');
      setConfirmDialog(null);
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Approve error:', error);
    }
  }, [approveMutation, confirmDialog]);

  const handleConfirmReject = useCallback(async () => {
    if (!confirmDialog) return;

    try {
      await rejectMutation.trigger({ requestId: confirmDialog.requestId });
      toast.success('Request rejected successfully');
      setConfirmDialog(null);
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Reject error:', error);
    }
  }, [rejectMutation, confirmDialog]);

  // Table columns for member requests
  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        render: (value: unknown, request: GroupJoinRequest) => {
          const user = request.user;
          if (!user) {
            return (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">?</span>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Unknown User</div>
                  <div className="text-sm text-muted-foreground">
                    {request.email}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.firstName?.[0] || '?'}
                  {user.lastName?.[0] || ''}
                </span>
              </div>
              <div>
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {request.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: unknown, request: GroupJoinRequest) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              request.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : request.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        ),
      },
      {
        key: 'requestDate',
        label: 'Request Date',
        render: (value: unknown, request: GroupJoinRequest) => (
          <div className="text-sm text-muted-foreground">
            {formatWithPattern(request.createdAt, 'MMM dd, yyyy')}
          </div>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        render: (value: unknown, request: GroupJoinRequest) => (
          <div className="text-sm text-muted-foreground">
            {request.user?.lastLogin
              ? formatWithPattern(request.user.lastLogin, 'MMM dd, yyyy')
              : 'Never'}
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (value: unknown, request: GroupJoinRequest) => {
          if (request.status !== 'pending') {
            return (
              <span className="text-sm text-muted-foreground">
                {request.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            );
          }

          const userName = request.user
            ? `${request.user.firstName} ${request.user.lastName}`
            : request.email;

          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="filled"
                Icon={AqCheckCircle}
                onClick={() => handleApprove(request._id, userName)}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleReject(request._id, userName)}
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            Failed to load member requests
          </div>
          <div className="text-sm text-muted-foreground">
            Please try again later
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <PageHeading
        title="MEMBER REQUESTS"
        subtitle={`Manage membership requests for ${formatGroupName(activeGroup?.title)}`}
      />

      {/* Member Requests Table */}
      <ServerSideTable
        title="Member Requests"
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
          disabled: approveMutation.isMutating || rejectMutation.isMutating,
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
          Are you sure you want to {confirmDialog?.type} the membership request
          from <strong>{confirmDialog?.userName}</strong>?
        </p>
      </ReusableDialog>
    </>
  );
};

export default MemberRequestsPage;
