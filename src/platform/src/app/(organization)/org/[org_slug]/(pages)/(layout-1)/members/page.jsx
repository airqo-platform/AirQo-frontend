'use client';

import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Button from '@/common/components/Button';
import CardWrapper from '@/common/components/CardWrapper';
import {
  getGroupDetailsApi,
  inviteUserToGroupTeam,
  removeUserFromGroup,
} from '@/core/apis/Account';
import { MembersPageSkeleton } from '@/common/components/Skeleton';
import { MembersTable, InviteModal } from '@/common/components/Members';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

const OrganizationMembersPage = ({ params: _params }) => {
  const { organization, primaryColor } = useOrganization();
  const activeGroup = useSelector((state) => state.groups?.activeGroup);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteEmails, setInviteEmails] = useState(['']);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the current active group details
  const [groupDetails, setGroupDetails] = useState(null);

  // Fetch group details and members from API
  const fetchMemberData = async () => {
    // Try to get group ID from organization first, then fallback to activeGroup
    const groupId = organization?._id || organization?.id || activeGroup?._id;

    if (!groupId) {
      console.log('No group ID available:', { organization, activeGroup });
      setError('No organization ID found');
      setLoading(false);
      return;
    }

    console.log('Fetching members for group:', groupId);
    setLoading(true);
    setError(null);
    try {
      const response = await getGroupDetailsApi(groupId);
      console.log('API Response:', response);
      if (response.success && response.group) {
        setGroupDetails(response.group);
        const groupMembers = response.group.grp_users || [];
        console.log('Group members found:', groupMembers.length);
        setMembers(groupMembers);
        setFilteredMembers(groupMembers);
      } else {
        const errorMsg = 'Failed to fetch group details: No valid response';
        console.error(errorMsg, response);
        setError(errorMsg);
        setMembers([]);
        setFilteredMembers([]);
      }
    } catch (error) {
      const errorMsg = `Failed to fetch group details: ${error.message}`;
      console.error(errorMsg, error);
      setError(errorMsg);
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle remove user from group
  const handleRemoveUser = async (user) => {
    const groupId = organization?._id || organization?.id || activeGroup?._id;

    if (!groupId || !user?._id) {
      alert('Invalid organization or user data');
      return;
    }

    setRemoveLoading(true);
    try {
      const response = await removeUserFromGroup(groupId, user._id);
      if (response.success) {
        // Refresh the members list
        await fetchMemberData();
        alert('User successfully removed from the organization');
      } else {
        throw new Error(response.message || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert(`Failed to remove user: ${error.message}`);
    } finally {
      setRemoveLoading(false);
    }
  };

  // Fetch group details and members from API on mount
  useEffect(() => {
    fetchMemberData();
  }, [organization?._id, activeGroup?._id]);

  // Filter members based on search and filters
  useEffect(() => {
    let filtered = members.filter((member) => {
      const matchesSearch =
        member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Map status based on user activity
      const userStatus = member.isActive ? 'active' : 'inactive';
      const matchesStatus =
        statusFilter === 'all' || userStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter]);

  const handleInviteMembers = async () => {
    const groupId = organization?._id || organization?.id || activeGroup?._id;

    if (!groupId) return;

    // Filter out empty emails
    const validEmails = inviteEmails.filter((email) => email.trim() !== '');

    if (validEmails.length === 0) {
      alert('Please enter at least one email address');
      return;
    }

    // Validate each email
    const invalidEmails = validEmails.filter((email) => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      alert('Please enter valid email addresses: ' + invalidEmails.join(', '));
      return;
    }

    setInviteLoading(true);

    try {
      const response = await inviteUserToGroupTeam(groupId, validEmails);
      if (response.success) {
        setShowInviteModal(false);
        setInviteEmails(['']);
        // Refresh the members list
        await fetchMemberData();
        alert('Invitations sent successfully!');
      }
    } catch (error) {
      console.error('Failed to invite members:', error);
      alert('Failed to send invitations. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Helper function to validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to format last active time
  const formatLastActive = (member) => {
    if (member.lastLogin) {
      const lastLoginDate = new Date(member.lastLogin);
      const now = new Date();
      const diffInMs = now - lastLoginDate;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          return diffInMinutes <= 1
            ? 'Just now'
            : `${diffInMinutes} minutes ago`;
        }
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      }
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    return 'Never';
  };

  if (!organization || loading) {
    return <MembersPageSkeleton />;
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Team Members
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your organization&apos;s team members and their roles
            </p>
          </div>
        </div>

        <CardWrapper>
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-red-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Failed to load members
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
            <div className="mt-6">
              <Button onClick={fetchMemberData} variant="filled">
                Try Again
              </Button>
            </div>
          </div>
        </CardWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Team Members
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your organization&apos;s team members and their roles
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} variant="filled">
          <FaUserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search and Filters */}
      <CardWrapper>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </CardWrapper>

      {/* Members Table */}
      <MembersTable
        members={filteredMembers}
        isLoading={loading}
        onRemoveUser={handleRemoveUser}
        removeLoading={removeLoading}
        groupDetails={groupDetails}
        formatLastActive={formatLastActive}
      />

      {/* Invite Modal */}
      <InviteModal
        showInviteModal={showInviteModal}
        setShowInviteModal={setShowInviteModal}
        inviteEmails={inviteEmails}
        setInviteEmails={setInviteEmails}
        handleInviteMembers={handleInviteMembers}
        inviteLoading={inviteLoading}
        primaryColor={primaryColor}
      />
    </div>
  );
};

export default OrganizationMembersPage;
