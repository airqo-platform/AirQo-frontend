'use client';

import React, { useState, useMemo } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import Dialog from '@/shared/components/ui/dialog';
import { Button, Input, Select } from '@/shared/components/ui';
import PageHeading from '@/shared/components/ui/page-heading';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupDetails, useSendGroupInvite } from '@/shared/hooks/useGroups';
import { useRolesByGroup, useAssignUsersToRole } from '@/shared/hooks/useAdmin';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { AqPlus, AqShield02 } from '@airqo/icons-react';
import { toast } from '@/shared/components/ui/toast';
import { ErrorBanner } from '@/shared/components/ui/banner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [emailErrors, setEmailErrors] = useState<string[]>(['']);

  // Multi-select states
  const [selectedMembers, setSelectedMembers] = useState<(string | number)[]>(
    []
  );
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Pagination states for members
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize, setMembersPageSize] = useState(10);
  const [membersSearch, setMembersSearch] = useState('');

  // Get group details
  const {
    data: groupData,
    isLoading: groupLoading,
    error: groupError,
    mutate,
  } = useGroupDetails(activeGroup?.id || null);
  const sendInvite = useSendGroupInvite();

  // Get roles for the active group
  const { data: rolesData, isLoading: rolesLoading } = useRolesByGroup(
    activeGroup?.id || undefined
  );
  const assignUsersToRole = useAssignUsersToRole();

  const group = groupData?.group;
  const roles = rolesData?.roles || [];

  const handleRefresh = () => {
    mutate();
  };

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
      {
        key: 'actions',
        label: 'Actions',
        render: (value: unknown, member: GroupMember) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/members/${member._id}`)}
              >
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [group?.grp_manager?._id, router]
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

  const handleBulkAssignRole = async () => {
    if (!selectedRoleId || selectedMembers.length === 0) {
      toast.error('Please select a role and members');
      return;
    }

    try {
      await assignUsersToRole.trigger({
        roleId: selectedRoleId,
        user_ids: selectedMembers as string[],
      });
      toast.success(`Role assigned to ${selectedMembers.length} member(s)`);
      setSelectedMembers([]);
      setSelectedRoleId('');
      setShowBulkRoleDialog(false);
    } catch {
      toast.error('Failed to assign role');
    }
  };

  return (
    <>
      {groupError ? (
        <ErrorBanner
          title="Failed to load group members"
          message="Unable to load group member information. Please try again later."
          actions={
            <Button onClick={handleRefresh} variant="outlined" size="sm">
              Try again
            </Button>
          }
        />
      ) : (
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
            <div className="flex items-center gap-2">
              {selectedMembers.length > 0 && (
                <Button
                  onClick={() => setShowBulkRoleDialog(true)}
                  variant="outlined"
                >
                  Assign Role ({selectedMembers.length})
                </Button>
              )}
              <Button onClick={() => setShowInviteDialog(true)} Icon={AqPlus}>
                Send Invites
              </Button>
            </div>
          </div>

          {/* Group Members Table */}
          <ServerSideTable
            title="Group Members"
            data={paginatedMembers.map(member => ({
              ...member,
              id: member._id,
            }))}
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
            multiSelect={true}
            selectedItems={selectedMembers}
            onSelectedItemsChange={setSelectedMembers}
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
                          onChange={e =>
                            handleEmailChange(index, e.target.value)
                          }
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

          {/* Bulk Role Assignment Dialog */}
          <Dialog
            isOpen={showBulkRoleDialog}
            onClose={() => setShowBulkRoleDialog(false)}
            title={`Assign Role to ${selectedMembers.length} Member${selectedMembers.length > 1 ? 's' : ''}`}
            primaryAction={{
              label: 'Assign Role',
              onClick: handleBulkAssignRole,
              disabled: assignUsersToRole.isMutating || !selectedRoleId,
              loading: assignUsersToRole.isMutating,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setShowBulkRoleDialog(false),
              disabled: assignUsersToRole.isMutating,
              variant: 'outlined',
            }}
          >
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Selected members:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1 mb-4">
                  {selectedMembers.map(memberId => {
                    const member = group?.grp_users?.find(
                      u => u._id === memberId
                    );
                    return member ? (
                      <div key={memberId} className="text-sm">
                        {member.firstName} {member.lastName} ({member.email})
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Role *
                </label>
                <Select
                  value={selectedRoleId}
                  onChange={e => setSelectedRoleId(e.target.value as string)}
                  placeholder="Choose a role..."
                  disabled={rolesLoading}
                >
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
                {rolesLoading && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Loading roles...
                  </p>
                )}
              </div>
            </div>
          </Dialog>
        </>
      )}
    </>
  );
};

export default MembersPage;
