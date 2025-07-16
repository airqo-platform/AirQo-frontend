'use client';
import { useEffect, useState, useCallback } from 'react';
import PermissionDenied from '@/common/components/PermissionDenied';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import { useSelector } from 'react-redux';
import Button from '@/common/components/Button';
import EmptyState from '@/common/components/EmptyState';
import ErrorState from '@/common/components/ErrorState';
import { getGroupDetailsApi, removeUserFromGroup } from '@/core/apis/Account';
import { MembersPageSkeleton } from '@/common/components/Skeleton';
import { MembersTable, InviteModal } from '@/common/components/Members';
import { FaUserPlus } from 'react-icons/fa';
import logger from '@/lib/logger';
import CustomToast from '@/components/Toast/CustomToast';

const OrganizationMembersPage = () => {
  const { organization, primaryColor } = useOrganization();
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

  const [members, setMembers] = useState([]);
  // No search/filter state needed
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // InviteModal now manages its own invite state
  const [removeLoading, setRemoveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getGroupId = useCallback(
    () => organization?._id || organization?.id || activeGroup?._id,
    [organization, activeGroup],
  );

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
    setPermissionDenied(false);
    try {
      const res = await getGroupDetailsApi(groupId);
      if (res.status === 403) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      if (res.success && res.group) {
        setGroupDetails(res.group);
        const users = res.group.grp_users || [];
        setMembers(users);
      } else {
        throw new Error(res.message || 'Invalid API response');
      }
    } catch (e) {
      // Check for 403 in error response
      if (e?.response?.status === 403) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      logger.error('Fetch members error', e);
      CustomToast({ message: e.message, type: 'error' });
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [organization, activeGroup, getGroupId]);

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

  // InviteModal now handles all invite logic

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

  if (permissionDenied) {
    return <PermissionDenied />;
  }

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

      {/* Removed CardWrapper with search/filter UI */}

      <MembersTable
        members={members}
        isLoading={loading}
        onRemoveUser={handleRemoveUser}
        removeLoading={removeLoading}
        groupDetails={groupDetails}
        formatLastActive={formatLastActive}
      />

      <InviteModal
        showInviteModal={showInviteModal}
        setShowInviteModal={setShowInviteModal}
        primaryColor={primaryColor}
        groupId={getGroupId()}
        onInvited={fetchMemberData}
      />
    </div>
  );
};

export default OrganizationMembersPage;
