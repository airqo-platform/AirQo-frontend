'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { Button, PageHeading } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import { formatDate } from '@/shared/utils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  AqEdit05,
  AqTrash01,
  AqRefreshCw05,
  AqEye,
  AqShieldTick,
  AqShield01,
} from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { clientService } from '@/shared/services/clientService';
import useSWR from 'swr';
import Dialog from '@/shared/components/ui/dialog';
import EditClientDialog from '@/modules/api-client/components/EditClientDialog';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { useRBAC, useUser } from '@/shared/hooks';
import type { Client } from '@/shared/types/api';

type TableClient = Client & { id: string };

const ClientsAdminPage: React.FC = () => {
  const router = useRouter();
  const { hasAnyPermission } = useRBAC();
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const [editDialogState, setEditDialogState] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null,
  });

  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
  }>({
    isOpen: false,
    clientId: '',
    clientName: '',
  });

  const [refreshSecretDialogState, setRefreshSecretDialogState] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
  }>({
    isOpen: false,
    clientId: '',
    clientName: '',
  });

  const [activateDialogState, setActivateDialogState] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
    activate: boolean;
  }>({
    isOpen: false,
    clientId: '',
    clientName: '',
    activate: true,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshingSecret, setIsRefreshingSecret] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Fetch all clients
  const {
    data: clientsResponse,
    isLoading,
    error,
    mutate,
  } = useSWR('/api/clients', () => clientService.getClients());

  const clients = useMemo(
    (): Client[] => clientsResponse?.clients || [],
    [clientsResponse]
  );

  // Filter clients based on status
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client =>
        statusFilter === 'active' ? client.isActive : !client.isActive
      );
    }

    return filtered;
  }, [clients, statusFilter]);

  // Transform clients data to match TableItem interface
  const tableData = useMemo(() => {
    return filteredClients.map((client: Client) => ({
      ...client,
      id: client._id,
    }));
  }, [filteredClients]);

  const handleEditClient = useCallback((client: TableClient) => {
    setEditDialogState({
      isOpen: true,
      client: client,
    });
  }, []);

  const handleViewClient = useCallback(
    (client: TableClient) => {
      router.push(`/system/clients/${client._id}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((client: TableClient) => {
    setDeleteDialogState({
      isOpen: true,
      clientId: client._id,
      clientName: client.name,
    });
  }, []);

  const handleRefreshSecretClick = useCallback((client: TableClient) => {
    setRefreshSecretDialogState({
      isOpen: true,
      clientId: client._id,
      clientName: client.name,
    });
  }, []);

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      await clientService.deleteClient(deleteDialogState.clientId);
      toast.success('Client deleted successfully');
      setDeleteDialogState({ isOpen: false, clientId: '', clientName: '' });
      mutate();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Delete client error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshSecret = async () => {
    if (!hasAnyPermission(['TOKEN_MANAGE', 'TOKEN_GENERATE'])) {
      toast.error('You do not have permission to manage tokens');
      return;
    }

    setIsRefreshingSecret(true);
    try {
      await clientService.refreshClientSecret(
        refreshSecretDialogState.clientId
      );
      toast.success('Client secret refreshed successfully');
      setRefreshSecretDialogState({
        isOpen: false,
        clientId: '',
        clientName: '',
      });
      mutate();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Refresh secret error:', error);
    } finally {
      setIsRefreshingSecret(false);
    }
  };

  const handleActivateClientClick = useCallback(
    (client: TableClient, activate: boolean) => {
      setActivateDialogState({
        isOpen: true,
        clientId: client.id,
        clientName: client.name,
        activate,
      });
    },
    []
  );

  const handleActivateClient = async () => {
    setIsActivating(true);
    try {
      await clientService.activateClient(activateDialogState.clientId, {
        isActive: activateDialogState.activate,
      });
      toast.success(
        `Client ${activateDialogState.activate ? 'activated' : 'deactivated'} successfully`
      );
      setActivateDialogState({
        isOpen: false,
        clientId: '',
        clientName: '',
        activate: true,
      });
      mutate();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Activate client error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const renderStatus = useCallback((value: unknown, item: TableClient) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}
      >
        {item.isActive ? 'Active' : 'Inactive'}
      </span>
    );
  }, []);

  const renderUser = useCallback((value: unknown, item: TableClient) => {
    if (!item.user) return '-';
    return (
      <div>
        <div className="font-medium text-sm">
          {item.user.firstName} {item.user.lastName}
        </div>
        <div className="text-xs text-gray-500">{item.user.email}</div>
      </div>
    );
  }, []);

  const renderCreatedDate = useCallback((value: unknown, item: TableClient) => {
    if (item.access_token?.createdAt) {
      return formatDate(item.access_token.createdAt, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return '-';
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Client Name',
        sortable: true,
        render: (value: unknown, item: TableClient) => (
          <button
            onClick={() => handleViewClient(item)}
            className="text-left hover:text-primary hover:underline font-medium"
          >
            {item.name}
          </button>
        ),
      },
      {
        key: 'user',
        label: 'User',
        sortable: false,
        render: renderUser,
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        render: renderStatus,
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: renderCreatedDate,
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        render: (value: unknown, item: TableClient) => (
          <div className="flex gap-1">
            <Tooltip content="View client details">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/system/clients/${item.id}`)}
                className="p-1 h-8 w-8"
              >
                <AqEye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Edit client">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditClient(item)}
                className="p-1 h-8 w-8"
              >
                <AqEdit05 className="w-4 h-4" />
              </Button>
            </Tooltip>
            {hasAnyPermission(['TOKEN_MANAGE', 'TOKEN_GENERATE']) && (
              <Tooltip content="Refresh client secret">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRefreshSecretClick(item)}
                  className="p-1 h-8 w-8"
                >
                  <AqRefreshCw05 className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
            <Tooltip
              content={item.isActive ? 'Deactivate client' : 'Activate client'}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleActivateClientClick(item, !item.isActive)}
                disabled={isActivating}
                className="p-1 h-8 w-8"
              >
                {item.isActive ? (
                  <AqShield01 className="w-4 h-4 text-orange-600" />
                ) : (
                  <AqShieldTick className="w-4 h-4 text-green-600" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="Delete client">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteClick(item)}
                className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <AqTrash01 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [
      renderStatus,
      renderUser,
      renderCreatedDate,
      handleEditClient,
      handleViewClient,
      handleDeleteClick,
      handleRefreshSecretClick,
      handleActivateClientClick,
      hasAnyPermission,
      router,
      isActivating,
    ]
  );

  return (
    <PermissionGuard
      requiredRoles={['AIRQO_SUPER_ADMIN']}
      customCheck={() => {
        const email = user?.email?.toLowerCase();
        return !!email && email.endsWith('@airqo.net');
      }}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You do not have the required permissions to access this page."
    >
      <div className="space-y-6">
        <PageHeading
          title="API Clients Management"
          subtitle="Manage all API clients across the platform. View, edit, and delete client credentials."
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter('all')}
          >
            All ({clients.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'active' ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter('active')}
          >
            Active ({clients.filter(c => c.isActive).length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'inactive' ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({clients.filter(c => !c.isActive).length})
          </Button>
          <Button
            size="sm"
            variant="outlined"
            Icon={AqRefreshCw05}
            onClick={handleRefresh}
            className="ml-auto"
          >
            Refresh
          </Button>
        </div>

        {/* Table */}
        <ServerSideTable
          title="All Clients"
          data={tableData}
          columns={columns}
          loading={isLoading}
          error={error?.message}
          showClientPagination={true}
        />

        {/* Edit Client Dialog */}
        <EditClientDialog
          isOpen={editDialogState.isOpen}
          client={editDialogState.client}
          onClose={() =>
            setEditDialogState({
              isOpen: false,
              client: null,
            })
          }
          onSuccess={() => {
            setEditDialogState({
              isOpen: false,
              client: null,
            });
            mutate();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          isOpen={deleteDialogState.isOpen}
          onClose={() =>
            setDeleteDialogState({
              isOpen: false,
              clientId: '',
              clientName: '',
            })
          }
          title="Delete Client"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the client{' '}
              <span className="font-semibold">
                {deleteDialogState.clientName}
              </span>
              ? This action cannot be undone and will invalidate all associated
              tokens.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() =>
                  setDeleteDialogState({
                    isOpen: false,
                    clientId: '',
                    clientName: '',
                  })
                }
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Client'}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Refresh Secret Confirmation Dialog */}
        <Dialog
          isOpen={refreshSecretDialogState.isOpen}
          onClose={() =>
            setRefreshSecretDialogState({
              isOpen: false,
              clientId: '',
              clientName: '',
            })
          }
          title="Refresh Client Secret"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to refresh the client secret for{' '}
              <span className="font-semibold">
                {refreshSecretDialogState.clientName}
              </span>
              ? The old secret will be invalidated and a new one will be
              generated.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() =>
                  setRefreshSecretDialogState({
                    isOpen: false,
                    clientId: '',
                    clientName: '',
                  })
                }
                disabled={isRefreshingSecret}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={handleRefreshSecret}
                disabled={isRefreshingSecret}
              >
                {isRefreshingSecret ? 'Refreshing...' : 'Refresh Secret'}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Activate/Deactivate Confirmation Dialog */}
        <Dialog
          isOpen={activateDialogState.isOpen}
          onClose={() =>
            setActivateDialogState({
              isOpen: false,
              clientId: '',
              clientName: '',
              activate: true,
            })
          }
          title={`${activateDialogState.activate ? 'Activate' : 'Deactivate'} Client`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to{' '}
              {activateDialogState.activate ? 'activate' : 'deactivate'} the
              client{' '}
              <span className="font-semibold">
                {activateDialogState.clientName}
              </span>
              ? This will{' '}
              {activateDialogState.activate
                ? 'enable the client to access the API'
                : 'prevent the client from accessing the API'}
              .
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() =>
                  setActivateDialogState({
                    isOpen: false,
                    clientId: '',
                    clientName: '',
                    activate: true,
                  })
                }
                disabled={isActivating}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={handleActivateClient}
                loading={isActivating}
                className={
                  activateDialogState.activate
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }
              >
                {isActivating
                  ? `${activateDialogState.activate ? 'Activating' : 'Deactivating'}...`
                  : `${activateDialogState.activate ? 'Activate' : 'Deactivate'} Client`}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default ClientsAdminPage;
