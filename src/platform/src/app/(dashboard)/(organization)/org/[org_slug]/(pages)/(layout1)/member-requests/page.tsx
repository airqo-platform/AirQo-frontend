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
import { PermissionGuard } from '@/shared/components';
import type { GroupJoinRequest } from '@/shared/types/api';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { useParams } from 'next/navigation';

const MemberRequestsPage: React.FC = () => {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const { groups } = useUser();

  // Get the current organization from slug
  const currentOrg = useMemo(() => {
    return groups?.find(g => g.organizationSlug === org_slug);
  }, [groups, org_slug]);

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

  // Expanded emails state
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  // Get member requests
  const {
    data: requestsData,
    isLoading,
    error,
    mutate,
  } = useGroupJoinRequests(currentOrg?.id || null);

  const approveMutation = useApproveGroupJoinRequest();
  const rejectMutation = useRejectGroupJoinRequest();

  const requests = useMemo(
    () => requestsData?.requests || [],
    [requestsData?.requests]
  );

  const handleRefresh = () => {
    mutate();
  };

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

  // Toggle expanded email
  const toggleExpandEmail = useCallback((id: string) => {
    setExpandedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

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
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                    ?
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-500 text-sm truncate">
                    Unknown User
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    {request.email}
                  </div>
                </div>
              </div>
            );
          }

          const isExpanded = expandedEmails.has(request._id);
          const emailText = request.email;
          const shouldTruncate = emailText.length > 30;

          return (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {user.firstName?.[0] || '?'}
                  {user.lastName?.[0] || ''}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`text-xs sm:text-sm text-muted-foreground ${!isExpanded && shouldTruncate ? 'truncate' : ''}`}
                  >
                    {isExpanded || !shouldTruncate
                      ? emailText
                      : emailText.slice(0, 30) + '...'}
                  </div>
                  {shouldTruncate && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpandEmail(request._id)}
                      className="text-xs p-0 h-auto"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                  )}
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
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {formatWithPattern(request.createdAt, 'MMM dd, yyyy')}
          </div>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        render: (value: unknown, request: GroupJoinRequest) => (
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
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
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {request.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            );
          }

          const userName = request.user
            ? `${request.user.firstName} ${request.user.lastName}`
            : request.email;

          return (
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <Button
                size="sm"
                variant="filled"
                Icon={AqCheckCircle}
                onClick={() => handleApprove(request._id, userName)}
                className="bg-green-600 hover:bg-green-700 text-xs whitespace-nowrap"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleReject(request._id, userName)}
                className="text-xs whitespace-nowrap"
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject, expandedEmails, toggleExpandEmail]
  );

  return (
    <PermissionGuard requiredPermissionsInActiveGroup={['MEMBER_VIEW']}>
      {error && (!requestsData || requestsData.success !== true) ? (
        <ErrorBanner
          title="Failed to load member requests"
          message="Unable to load member request information. Please try again later."
          actions={
            <Button onClick={handleRefresh} variant="outlined" size="sm">
              Try again
            </Button>
          }
        />
      ) : (
        <>
          {/* Page Header */}
          <PageHeading
            title="MEMBER REQUESTS"
            subtitle={`Manage membership requests for ${formatGroupName(currentOrg?.title)}`}
          />

          {/* Member Requests Table */}
          <div className="w-full max-w-full overflow-hidden">
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
              Are you sure you want to {confirmDialog?.type} the membership
              request from <strong>{confirmDialog?.userName}</strong>?
            </p>
          </ReusableDialog>
        </>
      )}
    </PermissionGuard>
  );
};

export default MemberRequestsPage;
