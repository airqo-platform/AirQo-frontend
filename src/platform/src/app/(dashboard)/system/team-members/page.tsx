'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import BulkRoleAssignmentDialog from '@/shared/components/BulkRoleAssignmentDialog';
import { feedbackService } from '@/modules/feedback';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import type { FeedbackStaffMember } from '@/shared/types/api';
import { AqEye } from '@airqo/icons-react';

const MembersContent: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);

  const { mutate } = useSWRConfig();

  useEffect(() => {
    setPage(1);
  }, [pageSize, setPage]);

  const {
    data: staffData,
    isLoading,
    error,
  } = useSWR('feedback/staff', () => feedbackService.getFeedbackStaff(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const allMembers = useMemo(() => staffData?.staff || [], [staffData?.staff]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return allMembers;
    const q = search.trim().toLowerCase();
    return allMembers.filter((member: FeedbackStaffMember) =>
      `${member.firstName} ${member.lastName} ${member.email} ${member.userName}`
        .toLowerCase()
        .includes(q)
    );
  }, [allMembers, search]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        render: (_value: unknown, member: FeedbackStaffMember) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {member.firstName?.[0] || '?'}
                {member.lastName?.[0] || ''}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {member.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'userName',
        label: 'Username',
        render: (_value: unknown, member: FeedbackStaffMember) => (
          <span className="text-sm text-muted-foreground">
            {member.userName || '--'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_value: unknown, member: FeedbackStaffMember) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/system/team-members/${member._id}`)}
            title="View member details"
            aria-label="View member details"
          >
            <AqEye className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [router]
  );

  if (isLoading) {
    return <LoadingState className="min-h-[400px]" text="Loading members..." />;
  }

  if (error) {
    if (isForbiddenError(error)) {
      return (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view members."
        />
      );
    }
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {getUserFriendlyErrorMessage(error)}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeading
          title="Members"
          subtitle={`${allMembers.length} member${allMembers.length !== 1 ? 's' : ''}`}
        />
        {selectedMembers.length > 0 && (
          <Button
            onClick={() => setShowBulkRoleDialog(true)}
            variant="outlined"
            showTextOnMobile
          >
            Assign Role ({selectedMembers.length})
          </Button>
        )}
      </div>

      <ServerSideTable
        data={paginatedMembers.map(member => ({
          ...member,
          id: member._id,
        }))}
        columns={columns}
        loading={false}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredMembers.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchTerm={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
        }}
        multiSelect
        selectedItems={selectedMembers}
        onSelectedItemsChange={ids =>
          setSelectedMembers(ids.map(id => String(id)))
        }
      />

      <BulkRoleAssignmentDialog
        isOpen={showBulkRoleDialog}
        onClose={() => setShowBulkRoleDialog(false)}
        userIds={selectedMembers}
        userCount={selectedMembers.length}
        onSuccess={() => {
          setSelectedMembers([]);
          mutate('feedback/staff');
        }}
      />
    </div>
  );
};

const MembersPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to view members."
    >
      <MembersContent />
    </PermissionGuard>
  );
};

export default MembersPage;
