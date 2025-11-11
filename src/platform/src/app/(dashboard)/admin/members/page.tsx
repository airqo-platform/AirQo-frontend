'use client';

import React, { useState, useMemo } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import Dialog from '@/shared/components/ui/dialog';
import { Button, Input } from '@/shared/components/ui';
import PageHeading from '@/shared/components/ui/page-heading';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupDetails, useSendGroupInvite } from '@/shared/hooks/useGroups';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { AqPlus, AqShield02 } from '@airqo/icons-react';
import { toast } from '@/shared/components/ui/toast';
import { AdminPageGuard } from '@/shared/components';

interface GroupMember {
  _id: string;
  verified?: boolean;
  permissions?: string[];
  firstName: string;
  lastName: string;
  email: string;
  description?: string;
  country?: string;
  isActive: boolean;
  lastLogin?: string;
  timezone?: string;
  loginCount?: number;
  analyticsVersion?: number;
  theme?: {
    primaryColor?: string;
    mode?: string;
    interfaceStyle?: string;
    contentLayout?: string;
  };
  preferredTokenStrategy?: string;
}

const MembersPage: React.FC = () => {
  const { activeGroup } = useUser();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [emailErrors, setEmailErrors] = useState<string[]>(['']);

  // Pagination states for members
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize, setMembersPageSize] = useState(10);
  const [membersSearch, setMembersSearch] = useState('');

  // Get group details
  const { data: groupData, isLoading: groupLoading } = useGroupDetails(
    activeGroup?.id || null
  );
  const sendInvite = useSendGroupInvite();

  const group = groupData?.group;

  const handleAddEmail = () => {
    setInviteEmails([...inviteEmails, '']);
    setEmailErrors([...emailErrors, '']);
  };

  const handleRemoveEmail = (index: number) => {
    if (inviteEmails.length > 1) {
      setInviteEmails(inviteEmails.filter((_, i) => i !== index));
      setEmailErrors(emailErrors.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);

    // Clear error when user starts typing
    const newErrors = [...emailErrors];
    newErrors[index] = '';
    setEmailErrors(newErrors);
  };

  // Filter and paginate members
  const filteredMembers = useMemo(() => {
    if (!group?.grp_users) return [];
    return group.grp_users.filter((member: GroupMember) =>
      `${member.firstName} ${member.lastName} ${member.email}`
        .toLowerCase()
        .includes(membersSearch.toLowerCase())
    );
  }, [group?.grp_users, membersSearch]);

  const paginatedMembers = useMemo(() => {
    const start = (membersPage - 1) * membersPageSize;
    const end = start + membersPageSize;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, membersPage, membersPageSize]);

  const membersTotalPages = Math.ceil(filteredMembers.length / membersPageSize);

  // Table columns for members
  const membersColumns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        render: (value: unknown, member: GroupMember) => {
          const isManager = group?.grp_manager?._id === member._id;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {member.firstName?.[0] || '?'}
                  {member.lastName?.[0] || ''}
                </span>
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {member.firstName} {member.lastName}
                  {isManager && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                      <AqShield02 size={12} />
                      Manager
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
                {member.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {member.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: unknown, member: GroupMember) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              member.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        render: (value: unknown, member: GroupMember) => (
          <div className="text-sm text-muted-foreground">
            {member.lastLogin
              ? formatWithPattern(member.lastLogin, 'MMM dd, yyyy')
              : 'Never'}
          </div>
        ),
      },
      {
        key: 'country',
        label: 'Country',
        render: (value: unknown, member: GroupMember) => (
          <div className="text-sm">{member.country || '--'}</div>
        ),
      },
    ],
    [group?.grp_manager?._id]
  );

  const handleSendInvites = async () => {
    if (!activeGroup?.id) {
      toast.error('No active group selected');
      return;
    }

    const emails = inviteEmails.filter(email => email.trim() !== '');

    if (emails.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    try {
      await sendInvite.trigger({
        groupId: activeGroup.id,
        inviteData: { emails },
      });
      toast.success(`Invitations sent to ${emails.length} email(s)`);
      setInviteEmails(['']);
      setEmailErrors(['']);
      setShowInviteDialog(false);
    } catch {
      toast.error('Failed to send invitations');
    }
  };

  return (
    <AdminPageGuard
      requiredPermissionsInActiveGroup={['USER_INVITE', 'USER_MANAGEMENT']}
    >
      <>
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <PageHeading
            title={`${(group?.grp_title || 'Group').toUpperCase()} MEMBERS`}
            subtitle={
              group
                ? `${group.grp_description} • ${group.numberOfGroupUsers} members`
                : undefined
            }
          />
          <Button onClick={() => setShowInviteDialog(true)} Icon={AqPlus}>
            Send Invites
          </Button>
        </div>

        {/* Group Members Table */}
        <ServerSideTable
          title="Group Members"
          data={paginatedMembers.map(member => ({ ...member, id: member._id }))}
          columns={membersColumns}
          loading={groupLoading}
          currentPage={membersPage}
          totalPages={membersTotalPages}
          pageSize={membersPageSize}
          totalItems={filteredMembers.length}
          onPageChange={setMembersPage}
          onPageSizeChange={setMembersPageSize}
          searchTerm={membersSearch}
          onSearchChange={setMembersSearch}
        />

        {/* Invite Dialog */}
        <Dialog
          isOpen={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          title="Send Group Invitations"
          primaryAction={{
            label: 'Send Invites',
            onClick: handleSendInvites,
            disabled: sendInvite.isMutating,
            loading: sendInvite.isMutating,
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setShowInviteDialog(false),
            disabled: sendInvite.isMutating,
            variant: 'outlined',
          }}
        >
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Addresses *
              </label>
              <div className="space-y-2">
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        value={email}
                        onChange={e => handleEmailChange(index, e.target.value)}
                        placeholder="user@example.com"
                        className="w-full"
                      />
                      {emailErrors[index] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {emailErrors[index]}
                        </p>
                      )}
                    </div>
                    {inviteEmails.length > 1 && (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => handleRemoveEmail(index)}
                        className="px-3"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddEmail}
                  className="w-full"
                >
                  + Add Email Address
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter email addresses to send invitations to join the group
              </p>
            </div>
          </div>
        </Dialog>
      </>
    </AdminPageGuard>
  );
};

export default MembersPage;
