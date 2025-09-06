'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrgRequests } from '@/lib/store/services/admin/OrgRequestsSlice';
import {
  approveOrganisationRequestApi,
  rejectOrganisationRequestApi,
} from '@/core/apis/Account';
import logger from '@/lib/logger';
import { PageHeader } from '@/common/components/Header';
import CustomToast from '@/components/Toast/CustomToast';
import ReusableTable from '@/common/components/Table';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import SettingsTabNavigation from '@/common/components/Tabs/SettingsTabNavigation';
import {
  AqCheckCircle,
  AqXCircle,
  AqInfoCircle,
  AqEye,
  AqCheck,
  AqX,
} from '@airqo/icons-react';
import moment from 'moment';

export default function OrgRequestsPage() {
  const dispatch = useDispatch();
  const { loading: requestsLoading } = useSelector(
    (state) => state.organisationRequests,
  );
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // Set pending as default
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 10;

  // Fetch requests on component mount
  useEffect(() => {
    let isMounted = true;

    dispatch(fetchOrgRequests())
      .unwrap()
      .then((fetchedRequests) => {
        if (isMounted && Array.isArray(fetchedRequests)) {
          setRequests(fetchedRequests);
        }
      })
      .catch((error) => {
        logger.error('Error fetching organization requests:', error);
        if (isMounted) {
          setRequests([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Memoized callbacks to prevent unnecessary re-renders
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      return moment(dateString).format('MMM DD, YYYY [at] HH:mm');
    } catch (error) {
      logger.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const openViewDialog = useCallback((request) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  }, []);

  const openApproveDialog = useCallback((request) => {
    setSelectedRequest(request);
    setIsApproveDialogOpen(true);
  }, []);

  const openRejectDialog = useCallback((request) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  }, []);

  // Filtered and sorted requests with performance optimization
  const filteredAndSortedRequests = useMemo(() => {
    let result = Array.isArray(requests) ? [...requests] : [];

    // Apply search filter
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      result = result.filter(
        (req) =>
          (req.organization_name || '').toLowerCase().includes(lowerSearch) ||
          (req.contact_name || '').toLowerCase().includes(lowerSearch) ||
          (req.contact_email || '').toLowerCase().includes(lowerSearch),
      );
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      result = result.filter(
        (req) => (req.status || '').toString().toLowerCase() === activeTab,
      );
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let aValue, bValue;
        if (sortField === 'createdAt') {
          aValue = new Date(a[sortField] || 0);
          bValue = new Date(b[sortField] || 0);
        } else {
          aValue = (a[sortField] || '').toString().toLowerCase();
          bValue = (b[sortField] || '').toString().toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [requests, searchQuery, activeTab, sortField, sortDirection]);

  // Paginated requests
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRequests.slice(start, start + itemsPerPage);
  }, [filteredAndSortedRequests, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(filteredAndSortedRequests.length / itemsPerPage),
    );
  }, [filteredAndSortedRequests.length, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, sortField, sortDirection]);

  // Clamp current page when totalPages changes
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value || '');
  }, []);

  const handleSortChange = useCallback((key) => {
    setSortField((prevField) => {
      if (prevField === key) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return key;
      } else {
        setSortDirection('asc');
        return key;
      }
    });
  }, []);

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    try {
      setIsApproving(true);
      await approveOrganisationRequestApi(selectedRequest._id);
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, status: 'approved' }
            : req,
        ),
      );
      CustomToast({
        message: `${selectedRequest.organization_name} has been approved successfully.`,
        type: 'success',
      });
    } catch (error) {
      logger.error('Error approving organization request:', error);
      CustomToast({
        message: 'Failed to approve organization request. Please try again.',
        type: 'error',
      });
    } finally {
      setIsApproving(false);
      setIsApproveDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !feedbackText.trim()) return;
    try {
      setIsRejecting(true);
      await rejectOrganisationRequestApi(
        selectedRequest._id,
        feedbackText.trim(),
      );
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, status: 'rejected' }
            : req,
        ),
      );
      CustomToast({
        message: `${selectedRequest.organization_name} has been rejected.`,
        type: 'success',
      });
    } catch (error) {
      logger.error('Error rejecting organization request:', error);
      CustomToast({
        message: 'Failed to reject organization request. Please try again.',
        type: 'error',
      });
    } finally {
      setIsRejecting(false);
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      setFeedbackText('');
    }
  };

  // Table columns configuration - memoized to prevent re-creation
  const tableColumns = useMemo(
    () => [
      {
        key: 'organization_name',
        label: 'Organization',
        sortable: true,
        render: (value, item) => (
          <div className="space-y-1">
            <div className="font-medium text-sm">{value || 'N/A'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.organization_type || 'N/A'}
            </div>
          </div>
        ),
      },
      {
        key: 'contact_name',
        label: 'Contact Person',
        sortable: true,
        render: (value, item) => (
          <div className="space-y-1">
            <div className="font-medium text-sm">{value || 'N/A'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.contact_email || 'N/A'}
            </div>
          </div>
        ),
      },
      {
        key: 'country',
        label: 'Country',
        sortable: true,
        render: (value) => value || 'N/A',
      },
      {
        key: 'createdAt',
        label: 'Submitted',
        sortable: true,
        render: (value) => <div className="text-xs">{formatDate(value)}</div>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value} />,
      },
      {
        key: 'use_case',
        label: 'Use Case',
        // allow wrapping within this column so long descriptions don't push other columns
        wrap: true,
        render: (value, item) => {
          const maxLength = 50;
          const isExpanded = expandedRows[item._id];
          const shouldTruncate = value && value.length > maxLength;

          return (
            <div className="w-[200px]">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {shouldTruncate && !isExpanded
                  ? `${value.substring(0, maxLength)}...`
                  : value || 'N/A'}
              </p>
              {shouldTruncate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(item._id);
                  }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_, item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openViewDialog(item);
              }}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              aria-label="View Details"
            >
              <AqEye className="w-4 h-4" />
            </button>
            {item.status === 'pending' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openApproveDialog(item);
                  }}
                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  aria-label="Approve"
                >
                  <AqCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRejectDialog(item);
                  }}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Reject"
                >
                  <AqX className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [
      formatDate,
      expandedRows,
      toggleExpand,
      openViewDialog,
      openApproveDialog,
      openRejectDialog,
    ],
  );

  // Tab configuration - memoized to prevent re-creation
  const tabs = useMemo(
    () => [
      { id: 'pending', name: 'Pending' },
      { id: 'all', name: 'All Requests' },
      { id: 'approved', name: 'Approved' },
      { id: 'rejected', name: 'Rejected' },
    ],
    [],
  );

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="Organization Requests"
        subtitle="Manage organization join requests"
      />
      <SettingsTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ReusableTable
        title="Manage Organization Requests"
        data={paginatedRequests}
        columns={tableColumns}
        searchable={true}
        filterable={false}
        pageSize={itemsPerPage}
        showPagination={true}
        sortable={true}
        onSort={handleSortChange}
        sortConfig={{ key: sortField, direction: sortDirection }}
        onSearchChange={handleSearchChange}
        searchTerm={searchQuery}
        loading={requestsLoading}
        className="mt-4"
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onRowClick={openViewDialog}
      />

      {/* View Dialog */}
      <ReusableDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        title="Organization Request Details"
        size="lg"
        showFooter={true}
        primaryAction={
          selectedRequest && selectedRequest.status === 'pending'
            ? {
                label: 'Approve',
                onClick: () => {
                  setIsViewDialogOpen(false);
                  openApproveDialog(selectedRequest);
                },
                className: 'bg-primary hover:bg-primary/90 text-white',
              }
            : undefined
        }
        secondaryAction={
          selectedRequest && selectedRequest.status === 'pending'
            ? {
                label: 'Reject',
                onClick: () => {
                  setIsViewDialogOpen(false);
                  openRejectDialog(selectedRequest);
                },
                variant: 'outlined',
              }
            : {
                label: 'Close',
                onClick: () => setIsViewDialogOpen(false),
                variant: 'outlined',
              }
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review the complete details of this organization request.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-4">
                <DetailItem
                  label="Organization Name"
                  value={selectedRequest.organization_name}
                />
                <DetailItem
                  label="Contact Person"
                  value={selectedRequest.contact_name}
                />
                <DetailItem
                  label="Contact Email"
                  value={selectedRequest.contact_email}
                />
              </div>
              <div className="space-y-4">
                <DetailItem label="Country" value={selectedRequest.country} />
                <DetailItem
                  label="Organization Type"
                  value={selectedRequest.organization_type}
                />
                <DetailItem
                  label="Submitted At"
                  value={formatDate(selectedRequest.createdAt)}
                />
                <DetailItem
                  label="Status"
                  value={<StatusBadge status={selectedRequest.status} />}
                />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-300">
                Use Case
              </h4>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {selectedRequest.use_case || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </ReusableDialog>

      {/* Approve Dialog */}
      <ReusableDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        title="Approve Organization"
        size="md"
        showFooter={true}
        primaryAction={{
          label: isApproving ? 'Approving...' : 'Approve',
          onClick: handleApproveRequest,
          disabled: isApproving,
          className: 'bg-green-600 hover:bg-green-700 text-white',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsApproveDialogOpen(false),
          variant: 'outlined',
        }}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedRequest.organization_name} will be granted access to
              AirQo Analytics.
            </p>
          </div>
        )}
      </ReusableDialog>

      {/* Reject Dialog */}
      <ReusableDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        title="Reject Organization"
        size="md"
        showFooter={true}
        primaryAction={{
          label: isRejecting ? 'Rejecting...' : 'Reject',
          onClick: handleRejectRequest,
          disabled: isRejecting || !feedbackText.trim(),
          className: 'bg-red-600 hover:bg-red-700 text-white',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsRejectDialogOpen(false),
          variant: 'outlined',
        }}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedRequest.organization_name} will be denied access to AirQo
              Analytics.
            </p>
            <div className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="reject-feedback"
                  className="block text-sm font-medium mb-1"
                >
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reject-feedback"
                  placeholder="Please provide a reason for rejection..."
                  className="w-full min-h-[100px] textarea textarea-bordered dark:bg-[#232425] dark:border-gray-700 dark:text-gray-100"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This reason will be included in the rejection email.
                </p>
              </div>
            </div>
          </div>
        )}
      </ReusableDialog>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      text: 'Pending',
      className:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      icon: AqInfoCircle,
    },
    approved: {
      text: 'Approved',
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      icon: AqCheckCircle,
    },
    rejected: {
      text: 'Rejected',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
      icon: AqXCircle,
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {IconComponent && <IconComponent className="mr-1.5 h-3 w-3" />}
      {config.text}
    </span>
  );
}

// Detail Item Component
function DetailItem({ label, value }) {
  return (
    <div>
      <h4 className="font-medium text-sm text-gray-500 dark:text-gray-300">
        {label}
      </h4>
      <p className="text-sm mt-1">{value}</p>
    </div>
  );
}
