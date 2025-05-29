import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import CustomToast from '@/components/Toast/CustomToast';
import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Card from '@/components/CardWrapper';
import moment from 'moment';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import FilterIcon from '@/icons/Actions/filter_alt.svg';
import Pagination from '@/components/Pagination';
// import Search from '@/icons/Actions/search.svg';
// import Filter from '@/icons/Actions/filter_alt.svg';
// import CheckIcon from '@/icons/tickIcon';
// import CloseIcon from '@/icons/close_icon';
// import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
// import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
// import MoreHorizIcon from '@/icons/Common/more_horiz.svg';

// Mock data (same as provided)
const mockRequests = [
  {
    _id: '664a1b2c3d4e5f6789012345',
    organization_name: 'Makerere University Air Lab',
    organization_slug: 'makerere-air-lab',
    contact_email: 'admin@makerere.ac.ug',
    contact_name: 'Dr. Jane Namutebi',
    use_case: 'Academic research on urban air quality monitoring in Kampala',
    organization_type: 'academic',
    status: 'pending',
    createdAt: '2025-05-15T10:30:00.000Z',
    updatedAt: '2025-05-15T10:30:00.000Z',
  },
  {
    _id: 'req-001',
    organization_name: 'Nairobi Air Lab',
    contact_name: 'Dr. Jane Achieng',
    contact_email: 'jane.achieng@example.com',
    country: 'Kenya',
    organization_type: 'Academic',
    createdAt: '2025-05-15T10:30:00Z',
    status: 'pending',
  },
  {
    _id: 'req-002',
    organization_name: 'Kampala City Council',
    contact_name: 'John Mukasa',
    contact_email: 'john.mukasa@example.gov.ug',
    country: 'Uganda',
    organization_type: 'Government',
    createdAt: '2025-05-14T08:15:00Z',
    status: 'pending',
  },
  {
    _id: 'req-003',
    organization_name: 'Clean Air Tanzania',
    contact_name: 'Sarah Mwangi',
    contact_email: 'sarah@cleanair.org',
    country: 'Tanzania',
    organization_type: 'NGO',
    createdAt: '2025-05-13T14:45:00Z',
    status: 'pending',
  },
  {
    _id: 'req-004',
    organization_name: 'Kigali Environmental Monitoring',
    contact_name: 'Emmanuel Habimana',
    contact_email: 'emmanuel@kem.rw',
    country: 'Rwanda',
    organization_type: 'Private',
    createdAt: '2025-05-12T11:20:00Z',
    status: 'approved',
  },
  {
    _id: 'req-005',
    organization_name: 'Addis Air Quality Initiative',
    contact_name: 'Abebe Bekele',
    contact_email: 'abebe@aaqi.et',
    country: 'Ethiopia',
    organization_type: 'NGO',
    createdAt: '2025-05-11T09:10:00Z',
    status: 'rejected',
  },
  {
    _id: 'req-006',
    organization_name: 'Dar es Salaam City Council',
    contact_name: 'Mary Kimani',
    contact_email: 'mary.kimani@dar.gov.tz',
    country: 'Tanzania',
    organization_type: 'Government',
    createdAt: '2025-05-10T13:25:00Z',
    status: 'pending',
  },
  {
    _id: 'req-007',
    organization_name: 'Mombasa Air Quality Network',
    contact_name: 'Hassan Omar',
    contact_email: 'hassan@maqn.org',
    country: 'Kenya',
    organization_type: 'NGO',
    createdAt: '2025-05-09T15:40:00Z',
    status: 'pending',
  },
  {
    _id: 'req-008',
    organization_name: 'Entebbe Research Institute',
    contact_name: 'Grace Nambi',
    contact_email: 'grace@eri.ug',
    country: 'Uganda',
    organization_type: 'Academic',
    createdAt: '2025-05-08T09:30:00Z',
    status: 'pending',
  },
  {
    _id: 'req-009',
    organization_name: 'Arusha Environmental Agency',
    contact_name: 'Daniel Masai',
    contact_email: 'daniel@arusha-env.org',
    country: 'Tanzania',
    organization_type: 'Government',
    createdAt: '2025-05-07T11:15:00Z',
    status: 'pending',
  },
  {
    _id: 'req-010',
    organization_name: 'Nairobi University',
    contact_name: 'Prof. Wangari Muthoni',
    contact_email: 'wangari@nairobi-uni.ac.ke',
    country: 'Kenya',
    organization_type: 'Academic',
    createdAt: '2025-05-06T14:20:00Z',
    status: 'pending',
  },
  {
    _id: 'req-011',
    organization_name: 'Kigali Smart City Initiative',
    contact_name: 'Jean-Paul Kagame',
    contact_email: 'jeanpaul@kigali-smart.rw',
    country: 'Rwanda',
    organization_type: 'Government',
    createdAt: '2025-05-05T10:10:00Z',
    status: 'pending',
  },
  {
    _id: 'req-012',
    organization_name: 'Kampala Air Monitors',
    contact_name: 'Elizabeth Okello',
    contact_email: 'elizabeth@kam.ug',
    country: 'Uganda',
    organization_type: 'Private',
    createdAt: '2025-05-04T16:30:00Z',
    status: 'pending',
  },
  {
    _id: 'req-013',
    organization_name: 'Addis Ababa University',
    contact_name: 'Dr. Tedros Haile',
    contact_email: 'tedros@aau.edu.et',
    country: 'Ethiopia',
    organization_type: 'Academic',
    createdAt: '2025-05-03T09:45:00Z',
    status: 'pending',
  },
  {
    _id: 'req-014',
    organization_name: 'Zanzibar Environmental Protection',
    contact_name: 'Fatima Ali',
    contact_email: 'fatima@zep.tz',
    country: 'Tanzania',
    organization_type: 'Government',
    createdAt: '2025-05-02T13:50:00Z',
    status: 'pending',
  },
  {
    _id: 'req-015',
    organization_name: 'Nairobi Clean Air Coalition',
    contact_name: 'James Omondi',
    contact_email: 'james@ncac.org',
    country: 'Kenya',
    organization_type: 'NGO',
    createdAt: '2025-05-01T11:25:00Z',
    status: 'pending',
  },
];

export default function OrgRequestsPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginatedRequests, setPaginatedRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get unique countries and organization types
  const uniqueCountries = [
    ...new Set(requests.map((req) => req.country)),
  ].sort();
  const uniqueTypes = [
    ...new Set(requests.map((req) => req.organization_type)),
  ].sort();

  // Filter and sort requests
  useEffect(() => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.organization_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          req.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.contact_email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((req) => req.organization_type === typeFilter);
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter((req) => req.country === countryFilter);
    }

    filtered.sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        const aValue = a[sortField]?.toLowerCase() || '';
        const bValue = b[sortField]?.toLowerCase() || '';
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setFilteredRequests(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [
    requests,
    searchQuery,
    statusFilter,
    typeFilter,
    countryFilter,
    sortField,
    sortDirection,
  ]);

  // Update paginated requests
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRequests(filteredRequests.slice(startIndex, endIndex));
  }, [filteredRequests, currentPage]);

  const handleSearchChange = (value) => setSearchQuery(value);

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

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCountryFilter('all');
    setSortField('createdAt');
    setSortDirection('desc');
  };

  const SearchAndFilter = () => (
    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6 gap-3 px-6">
      {/* <div className="relative w-full sm:w-64">
        <svg
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search organizations..."
          className="input input-bordered w-full pl-10"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div> */}
      {/* <SearchBar onSearch={handleSearchChange} /> */}
      {/* <div className="dropdown ml-2 md:ml-0">
        <Button
          variant="outlined"
          className={
            'max-w-[114px] w-full h-9 bg-grey-250 rounded-xl text-black-900 text-sm font-medium'
          }
        >
          <span className="mr-1">
            <FilterIcon />
          </span>
          Filter
          <span className="ml-[10px]">
            <ArrowDropDownIcon />
          </span>
        </Button>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-xl w-44">
          <li
            role="button"
            onClick={(e) => setTypeFilter(e.target.value)}
            className="text-sm text-grey leading-5"
          >
            <a>Newest date first</a>
          </li>
          <li
            role="button"
            onClick={() => handleSort('oldest')}
            className="text-sm text-grey leading-5"
          >
            <a>Oldest date first</a>
          </li>
          <li
            role="button"
            onClick={() => handleSort('ascending')}
            className="text-sm text-grey leading-5"
          >
            <a>Name A {'-->'} Z</a>
          </li>
          <li
            role="button"
            onClick={() => handleSort('descending')}
            className="text-sm text-grey leading-5"
          >
            <a>Name Z {'-->'} A</a>
          </li>
        </ul>
      </div> */}

      {/* <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-outline btn-sm">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          Filter
        </label>
        <div
          tabIndex={0}
          className="dropdown-content menu p-4 bg-base-100 shadow rounded-box w-64"
        >
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Organization Type</p>
            <select
              className="select select-bordered w-full"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Country</p>
            <select
              className="select select-bordered w-full"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Sort By</p>
            <select
              className="select select-bordered w-full"
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <option value="createdAt-desc">Date (Newest)</option>
              <option value="createdAt-asc">Date (Oldest)</option>
              <option value="organization_name-asc">Name (A-Z)</option>
              <option value="organization_name-desc">Name (Z-A)</option>
              <option value="country-asc">Country (A-Z)</option>
              <option value="organization_type-asc">Type (A-Z)</option>
            </select>
          </div>
          <button
            className="btn btn-ghost w-full text-left"
            onClick={resetFilters}
          >
            Reset All Filters
          </button>
        </div>
      </div> */}
    </div>
  );

  return (
    <Layout
      topbarTitle={'Organization Management'}
      noBorderBottom
      pageTitle="Organization Management"
    >
      <Card
        rounded
        padding="p-0"
        className="m-0"
        header={
          <div className="px-3 pt-4 md:flex w-full justify-between items-center gap-5">
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
              <SearchAndFilter />
              <RequestsTable
                requests={paginatedRequests.filter(
                  (req) => req.status === 'pending',
                )}
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
              <SearchAndFilter />
              <RequestsTable
                requests={paginatedRequests.filter(
                  (req) => req.status === 'approved',
                )}
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
              <SearchAndFilter />
              <RequestsTable
                requests={paginatedRequests.filter(
                  (req) => req.status === 'rejected',
                )}
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
              <SearchAndFilter />
              <RequestsTable
                requests={paginatedRequests}
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
              <h3 className="font-bold text-lg">
                Organization Request Details
              </h3>
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
    </Layout>
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

function RequestsTable({
  requests,
  onView,
  onApprove,
  onReject,
  handleSortChange,
  sortField,
  sortDirection,
}) {
  const getSortIcon = (field) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : null;

  const { theme, systemTheme } = useTheme();

  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  const styles = useMemo(
    () => ({
      dropdownHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      dropdownText: isDarkMode ? 'text-white' : 'text-gray-800',
      dropdownBackground: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
    }),
    [isDarkMode],
  );

  return (
    <Card
      bordered={false}
      rounded={false}
      padding="p-0"
      className="overflow-x-auto overflow-y-hidden"
    >
      <table className="border-collapse text-xs text-left w-full h-full mb-6">
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
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="text-center pt-6 text-grey-300 dark:text-gray-400"
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
  );
}
