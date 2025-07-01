'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import { useSelector } from 'react-redux';
import Button from '@/common/components/Button';
import CardWrapper from '@/common/components/CardWrapper';
import EmptyState from '@/common/components/EmptyState';
import ErrorState from '@/common/components/ErrorState';
import {
  getGroupDetailsApi,
  inviteUserToGroupTeam,
  removeUserFromGroup,
} from '@/core/apis/Account';
import { MembersPageSkeleton } from '@/common/components/Skeleton';
import { MembersTable, InviteModal } from '@/common/components/Members';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import logger from '@/lib/logger';
import CustomToast from '@/components/Toast/CustomToast';

const OrganizationMembersPage = () => {
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
  const [groupDetails, setGroupDetails] = useState(null);

  const getGroupId = () =>
    organization?._id || organization?.id || activeGroup?._id;

  const fetchMemberData = useCallback(async () => {
    const groupId = getGroupId();
    if (!groupId) {
      logger.warn('No group ID available', { organization, activeGroup });
      setError('No organization ID found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getGroupDetailsApi(groupId);
      if (res.success && res.group) {
        setGroupDetails(res.group);
        const users = res.group.grp_users || [];
        setMembers(users);
        setFilteredMembers(users);
      } else {
        throw new Error(res.message || 'Invalid API response');
      }
    } catch (e) {
      logger.error('Fetch members error', e);
      CustomToast({ message: e.message, type: 'error' });
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [organization, activeGroup]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const handleRemoveUser = async (user) => {
    const groupId = getGroupId();
    if (!groupId || !user?._id) {
      CustomToast({ message: 'Invalid organization or user', type: 'warning' });
      return;
    }
    setRemoveLoading(true);
    try {
      const res = await removeUserFromGroup(groupId, user._id);
      if (res.success) {
        CustomToast({ message: 'User removed successfully', type: 'success' });
        await fetchMemberData();
      } else {
        throw new Error(res.message || 'Remove failed');
      }
    } catch (e) {
      logger.error('Remove user error', e);
      CustomToast({ message: e.message, type: 'error' });
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleInviteMembers = async () => {
    const groupId = getGroupId();
    if (!groupId) {
      CustomToast({ message: 'No group selected', type: 'warning' });
      return;
    }
    const validEmails = inviteEmails.filter((e) => e.trim());
    if (!validEmails.length) {
      CustomToast({ message: 'Enter at least one email', type: 'warning' });
      return;
    }
    const invalid = validEmails.filter(
      (e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
    );
    if (invalid.length) {
      CustomToast({
        message: `Invalid emails: ${invalid.join(', ')}`,
        type: 'error',
      });
      return;
    }

    setInviteLoading(true);
    try {
      // API expects { emails: [...] }
      const res = await inviteUserToGroupTeam(groupId, validEmails);
      if (res.success) {
        CustomToast({ message: 'Invitations sent!', type: 'success' });
        setShowInviteModal(false);
        setInviteEmails(['']);
        await fetchMemberData();
      } else {
        throw new Error(res.message || 'Invite failed');
      }
    } catch (e) {
      logger.error('Invite error', e);
      // Extract API errors
      const apiData = e.response?.data;
      let msg = e.message;
      if (apiData) {
        if (Array.isArray(apiData.errors) && apiData.errors.length) {
          msg = apiData.errors
            .map((err) =>
              Array.isArray(err.message) ? err.message.join(', ') : err.message,
            )
            .join('; ');
        } else if (apiData.message) {
          msg = apiData.message;
        }
      }
      CustomToast({ message: msg, type: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    const filtered = members.filter((m) => {
      const name = `${m.firstName} ${m.lastName}`.toLowerCase();
      const matchSearch =
        name.includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const status = m.isActive ? 'active' : 'inactive';
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchStatus;
    });
    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter]);

  const formatLastActive = (m) => {
    if (!m.lastLogin) return 'Never';
    const diff = Date.now() - new Date(m.lastLogin);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const mins = Math.floor(diff / (1000 * 60));
    return mins <= 1 ? 'Just now' : `${mins} minutes ago`;
  };

  if (!organization || loading) return <MembersPageSkeleton />;

  if (error) {
    // Use ErrorState for API/server errors
    return (
      <ErrorState
        type="server"
        title="Unable to load team members"
        description={
          <>
            {error}
            <br />
            <span className="text-sm text-gray-500">
              Please try again or contact support if the issue persists.
            </span>
          </>
        }
        onPrimaryAction={fetchMemberData}
        primaryAction="Retry"
        size="medium"
        variant="card"
      />
    );
  }

  if (members.length === 0 && !loading) {
    // Use EmptyState for no members
    return (
      <EmptyState
        preset="users"
        actionLabel="Invite member"
        onAction={() => setShowInviteModal(true)}
        size="medium"
        variant="card"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl">Team Members</h1>
          <p className="text-sm text-gray-500">Manage your team</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} variant="filled">
          <FaUserPlus className="mr-2" /> Invite Member
        </Button>
      </div>

      <CardWrapper>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 border rounded"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </CardWrapper>

      <MembersTable
        members={filteredMembers}
        isLoading={loading}
        onRemoveUser={handleRemoveUser}
        removeLoading={removeLoading}
        groupDetails={groupDetails}
        formatLastActive={formatLastActive}
      />

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
