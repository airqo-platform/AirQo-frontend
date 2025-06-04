'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import CustomToast from '@/components/Toast/CustomToast';
import Tabs from '@/components/Tabs';
import Card from '@/components/CardWrapper';
import moment from 'moment';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/Admin/Organizations/Search';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchOrgRequests } from '@/lib/store/services/admin/OrgRequestsSlice';
import logger from '@/lib/logger';

export default function OrgRequestsPage() {
  const dispatch = useDispatch();
  const orgRequests = useSelector(
    (state) => state.organisationRequests.organisationRequests,
  );
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const { theme, systemTheme } = useTheme();

  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  const styles = useMemo(
    () => ({
      collapseButton: isDarkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      scrollbar: isDarkMode
        ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
        : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
      divider: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      dropdownHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      dropdownText: isDarkMode ? 'text-white' : 'text-gray-800',
      dropdownBackground: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      iconFill: isDarkMode ? 'ffffff' : undefined,
      stroke: isDarkMode ? 'white' : '#1f2937',
    }),
    [isDarkMode],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginatedRequests, setPaginatedRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    dispatch(fetchOrgRequests())
      .unwrap()
      .catch((error) => {
        logger.error('Error fetching organization requests:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(orgRequests)) {
      setRequests(orgRequests);
    } else {
      setRequests([]);
    }
  }, [orgRequests]);

  useEffect(() => {
    if (!Array.isArray(requests) || requests.length === 0) {
      setFilteredRequests([]);
      setPaginatedRequests([]);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          (req.organization_name || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (req.contact_name || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (req.contact_email || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const aValue = (a[sortField] || '').toLowerCase();
        const bValue = (b[sortField] || '').toLowerCase();
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setFilteredRequests(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [requests, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    if (!Array.isArray(filteredRequests)) {
      setPaginatedRequests([]);
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRequests(filteredRequests.slice(startIndex, endIndex));
  }, [filteredRequests, currentPage]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value || '');
  }, []);

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    const updatedRequests = requests.map((req) =>
      req._id === selectedRequest._id ? { ...req, status: 'approved' } : req,
    );
    setRequests(updatedRequests);
    CustomToast({
      message: `${selectedRequest.organization_name} has been approved successfully.`,
      type: 'success',
    });
    setIsApproveDialogOpen(false);
    setSelectedRequest(null);
    setFeedbackText('');
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    const updatedRequests = requests.map((req) =>
      req._id === selectedRequest._id ? { ...req, status: 'rejected' } : req,
    );
    setRequests(updatedRequests);
    CustomToast({
      message: `${selectedRequest.organization_name} has been rejected.`,
      type: 'error',
    });
    setIsRejectDialogOpen(false);
    setSelectedRequest(null);
    setFeedbackText('');
  };

  return (
    <Card
      rounded
      padding="p-0"
      className="m-0"
      header={
        <div className="px-3 pt-4 w-full">
          <div>
            <h3 className="text-gray-700 dark:text-white font-medium text-lg">
              Manage Organization Requests
            </h3>
            <p
              className={`text-sm md:max-w-[640px] w-full ${styles.mutedText}`}
            >
              Review and process access requests from partner organizations.
            </p>
          </div>
        </div>
      }
      headerProps={{
        className:
          'px-3 py-2 flex flex-col md:flex-row justify-between items-center gap-2',
      }}
    >
      <div>
        <Tabs customPadding="px-6">
          <div label="Pending">
            <RequestsTable
              requests={
                Array.isArray(paginatedRequests)
                  ? paginatedRequests.filter(
                      (req) => (req.status || '') === 'pending',
                    )
                  : []
              }
              formatDate={formatDate}
              onView={(request) => {
                setSelectedRequest(request);
                setIsViewDialogOpen(true);
              }}
              onApprove={(request) => {
                setSelectedRequest(request);
                setIsApproveDialogOpen(true);
              }}
              onReject={(request) => {
                setSelectedRequest(request);
                setIsRejectDialogOpen(true);
              }}
              handleSortChange={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSearchChange={handleSearchChange}
              styles={styles}
              searchTerm={searchQuery}
            />
            <Pagination
              currentPage={currentPage}
              pageSize={itemsPerPage}
              totalItems={filteredRequests.length}
              onPrevClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              onNextClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              onPageChange={handlePageChange}
            />
          </div>
          <div label="Approved">
            <RequestsTable
              requests={
                Array.isArray(paginatedRequests)
                  ? paginatedRequests.filter(
                      (req) => (req.status || '') === 'approved',
                    )
                  : []
              }
              formatDate={formatDate}
              onView={(request) => {
                setSelectedRequest(request);
                setIsViewDialogOpen(true);
              }}
              onApprove={(request) => {
                setSelectedRequest(request);
                setIsApproveDialogOpen(true);
              }}
              onReject={(request) => {
                setSelectedRequest(request);
                setIsRejectDialogOpen(true);
              }}
              handleSortChange={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSearchChange={handleSearchChange}
              styles={styles}
              searchTerm={searchQuery}
            />
            <Pagination
              currentPage={currentPage}
              pageSize={itemsPerPage}
              totalItems={filteredRequests.length}
              onPrevClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              onNextClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              onPageChange={handlePageChange}
            />
          </div>
          <div label="Rejected">
            <RequestsTable
              requests={
                Array.isArray(paginatedRequests)
                  ? paginatedRequests.filter(
                      (req) => (req.status || '') === 'rejected',
                    )
                  : []
              }
              formatDate={formatDate}
              onView={(request) => {
                setSelectedRequest(request);
                setIsViewDialogOpen(true);
              }}
              onApprove={(request) => {
                setSelectedRequest(request);
                setIsApproveDialogOpen(true);
              }}
              onReject={(request) => {
                setSelectedRequest(request);
                setIsRejectDialogOpen(true);
              }}
              handleSortChange={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSearchChange={handleSearchChange}
              styles={styles}
              searchTerm={searchQuery}
            />
            <Pagination
              currentPage={currentPage}
              pageSize={itemsPerPage}
              totalItems={filteredRequests.length}
              onPrevClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              onNextClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              onPageChange={handlePageChange}
            />
          </div>
          <div label="All Requests">
            <RequestsTable
              requests={
                Array.isArray(paginatedRequests) ? paginatedRequests : []
              }
              formatDate={formatDate}
              onView={(request) => {
                setSelectedRequest(request);
                setIsViewDialogOpen(true);
              }}
              onApprove={(request) => {
                setSelectedRequest(request);
                setIsApproveDialogOpen(true);
              }}
              onReject={(request) => {
                setSelectedRequest(request);
                setIsRejectDialogOpen(true);
              }}
              handleSortChange={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSearchChange={handleSearchChange}
              styles={styles}
              searchTerm={searchQuery}
            />

            <Pagination
              currentPage={currentPage}
              pageSize={itemsPerPage}
              totalItems={filteredRequests.length}
              onPrevClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              onNextClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              onPageChange={handlePageChange}
            />
          </div>
        </Tabs>

        {/* View Request Modal */}
        <input
          type="checkbox"
          id="view-modal"
          className="modal-toggle"
          checked={isViewDialogOpen}
          onChange={() => setIsViewDialogOpen(!isViewDialogOpen)}
        />
        <div className="modal">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Organization Request Details</h3>
            <p className="text-sm text-gray-500">
              Review the complete details of this organization request.
            </p>
            {selectedRequest && (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm">Organization Name</h4>
                  <p>{selectedRequest.organization_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Contact Person</h4>
                  <p>{selectedRequest.contact_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Contact Email</h4>
                  <p>{selectedRequest.contact_email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Country</h4>
                  <p>{selectedRequest.country}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Organization Type</h4>
                  <p>{selectedRequest.organization_type}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Submitted At</h4>
                  <p>{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Status</h4>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </button>
              {selectedRequest && selectedRequest.status === 'pending' && (
                <>
                  <button
                    className="btn btn-error"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsApproveDialogOpen(true);
                    }}
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Approve Request Modal */}
        <input
          type="checkbox"
          id="approve-modal"
          className="modal-toggle"
          checked={isApproveDialogOpen}
          onChange={() => setIsApproveDialogOpen(!isApproveDialogOpen)}
        />
        <div className="modal">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Approve Organization</h3>
            <p className="text-sm text-gray-500">
              {selectedRequest?.organization_name} will be granted access to
              NetManager.
            </p>
            <div className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="approve-feedback"
                  className="block text-sm font-medium mb-1"
                >
                  Approval Message (Optional)
                </label>
                <textarea
                  id="approve-feedback"
                  placeholder="Enter any additional information or instructions..."
                  className="textarea textarea-bordered w-full min-h-[100px]"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in the approval email.
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setIsApproveDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApproveRequest}
              >
                Approve
              </button>
            </div>
          </div>
        </div>

        {/* Reject Request Modal */}
        <input
          type="checkbox"
          id="reject-modal"
          className="modal-toggle"
          checked={isRejectDialogOpen}
          onChange={() => setIsRejectDialogOpen(!isRejectDialogOpen)}
        />
        <div className="modal">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Reject Organization</h3>
            <p className="text-sm text-gray-500">
              {selectedRequest?.organization_name} will be denied access to
              NetManager.
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
                  className="textarea textarea-bordered w-full min-h-[100px]"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be included in the rejection email.
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleRejectRequest}
                disabled={!feedbackText.trim()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }) {
  const badgeClass =
    {
      pending: 'badge badge-outline',
      approved: 'badge badge-success',
      rejected: 'badge badge-error',
    }[status] || 'badge badge-outline';

  return (
    <span className={`${badgeClass} text-xs`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const SearchAndFilter = ({ searchTerm, onSearchChange }) => (
  <div className="mb-2 px-6 w-full">
    <SearchBar
      value={searchTerm}
      onChange={onSearchChange}
      placeholder="Search organizations..."
    />
  </div>
);

function RequestsTable({
  requests,
  onView,
  onApprove,
  onReject,
  handleSortChange,
  sortField,
  sortDirection,
  handleSearchChange,
  styles,
  searchTerm,
}) {
  const getSortIcon = (field) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : null;

  return (
    <>
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      <Card
        bordered={false}
        rounded={false}
        padding="px-6"
        className="overflow-x-auto overflow-y-hidden"
      >
        <table className="border-collapse border text-xs text-left w-full h-full mb-6">
          <thead>
            <tr className="text-black dark:text-white text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25 dark:bg-gray-800">
              <th
                className="w-[200px] cursor-pointer opacity-40 font-medium px-4 py-3"
                onClick={() => handleSortChange('organization_name')}
              >
                Organization {getSortIcon('organization_name')}
              </th>
              <th className="px-4 py-3 opacity-40 font-medium">Contact</th>
              <th className="px-4 py-3 opacity-40 font-medium w-[200px]">
                Use case
              </th>
              <th
                className="cursor-pointer opacity-40 font-medium px-4 py-3"
                onClick={() => handleSortChange('country')}
              >
                Country {getSortIcon('country')}
              </th>
              <th
                className="cursor-pointer opacity-40 font-medium px-4 py-3"
                onClick={() => handleSortChange('organization_type')}
              >
                Type {getSortIcon('organization_type')}
              </th>
              <th
                className="cursor-pointer opacity-40 font-medium px-4 py-3"
                onClick={() => handleSortChange('createdAt')}
              >
                Submitted {getSortIcon('createdAt')}
              </th>
              <th className="px-4 py-3 opacity-40">Status</th>
              <th className="text-right px-4 py-3 opacity-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(requests) || requests.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-grey-300 dark:text-gray-400"
                >
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr
                  key={request._id}
                  className={`border-b border-b-secondary-neutral-light-100 dark:border-b-gray-700 hover:bg-secondary-neutral-light-25 hover:dark:bg-gray-700 focus:bg-gray-200 focus:dark:bg-gray-600`}
                >
                  <td className="w-[200px] font-normal text-sm leading-5 text-secondary-neutral-light-800 dark:text-white px-4 py-3 capitalize">
                    {request.organization_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-normal text-sm leading-5 text-secondary-neutral-light-400 dark:text-gray-300 capitalize">
                        {request.contact_name}
                      </span>
                      <span className="font-normal text-xs leading-5 text-secondary-neutral-light-400 dark:text-gray-300">
                        {request.contact_email}
                      </span>
                    </div>
                  </td>
                  <td className="w-[200px] px-4 py-3 font-normal text-sm leading-5 text-secondary-neutral-light-400 dark:text-gray-300 capitalize">
                    {request.use_case}
                  </td>
                  <td className="px-4 py-3 font-normal text-sm leading-5 text-secondary-neutral-light-400 dark:text-gray-300 capitalize">
                    {request.country}
                  </td>
                  <td className="px-4 py-3 font-normal text-sm leading-5 text-secondary-neutral-light-400 dark:text-gray-300 capitalize">
                    {request.organization_type}
                  </td>
                  <td className="px-4 py-3 font-normal text-sm leading-5 text-secondary-neutral-light-400 dark:text-gray-300">
                    {moment(request.createdAt).format('MMM DD, YYYY')}
                  </td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="text-right px-4 py-3">
                    <div className="dropdown dropdown-end">
                      <label
                        tabIndex={0}
                        className="w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </label>
                      <ul
                        tabIndex={0}
                        className={`dropdown-content menu shadow ${styles.dropdownBackground} rounded-box w-52`}
                      >
                        <li>
                          <a onClick={() => onView(request)}>View Details</a>
                        </li>
                        {request.status === 'pending' && (
                          <>
                            <li
                              className={`${styles.dropdownHover}
                              ${styles.dropdownText}`}
                            >
                              <a onClick={() => onApprove(request)}>
                                <svg
                                  className="h-4 w-4 text-green-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Approve
                              </a>
                            </li>
                            <li
                              className={`${styles.dropdownHover}
                              ${styles.dropdownText}`}
                            >
                              <a onClick={() => onReject(request)}>
                                <svg
                                  className="h-4 w-4 text-red-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Reject
                              </a>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
