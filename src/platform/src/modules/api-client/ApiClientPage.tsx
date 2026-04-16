'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import { Button, MultiSelectTable, PageHeading } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { formatDate, parseDate } from '@/shared/utils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { AqPlus, AqEdit05 } from '@airqo/icons-react';
import { useClientsByUserId, useGenerateToken } from '@/shared/hooks/useClient';
import InactiveClientDialog from './components/InactiveClientDialog';
import CreateClientDialog from './components/CreateClientDialog';
import EditClientDialog from './components/EditClientDialog';
import TokenDisplay from './components/TokenDisplay';
import type { Client } from '@/shared/types/api';
import UsageStats from '../billing/components/UsageStats';
import { trackApiClientAction } from '@/shared/utils/enhancedAnalytics';

type TableClient = Client & { id: string };

const ApiClientPage: React.FC = () => {
  const { data: session } = useSession();
  const posthog = usePostHog();
  const [inactiveDialogState, setInactiveDialogState] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
  }>({
    isOpen: false,
    clientId: '',
    clientName: '',
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeGeneratingTokenId, setActiveGeneratingTokenId] = useState<
    string | null
  >(null);
  const [editDialogState, setEditDialogState] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null,
  });

  const userId = (session?.user as { _id?: string })?._id;
  const {
    data: clientsResponse,
    isLoading,
    mutate,
  } = useClientsByUserId(userId || '');
  const { trigger: generateToken, isMutating: isGeneratingToken } =
    useGenerateToken();

  const clients = useMemo(
    (): Client[] => clientsResponse?.clients || [],
    [clientsResponse]
  );

  // Transform clients data to match TableItem interface
  const tableData = useMemo(() => {
    return clients.map((client: Client) => ({
      ...client,
      id: client._id,
    }));
  }, [clients]);

  const handleGenerateToken = useCallback(
    async (client: TableClient, mode: 'generate' | 'refresh' = 'generate') => {
      if (!client.isActive) {
        setInactiveDialogState({
          isOpen: true,
          clientId: client._id,
          clientName: client.name,
        });
        return;
      }

      setActiveGeneratingTokenId(client._id);
      try {
        await generateToken({
          name: client.name,
          client_id: client._id,
        });
        trackApiClientAction(
          posthog,
          mode === 'refresh' ? 'refresh_token' : 'generate_token',
          {
            client_id: client._id,
            client_name_length: client.name.trim().length,
            token_status: client.access_token?.token_status || 'active',
            mode,
          }
        );
        toast.success('Token generated successfully');
        // Refresh clients list to pick up the new/updated token
        await mutate();
      } catch (error) {
        toast.error(getUserFriendlyErrorMessage(error));
        console.error('Generate token error:', error);
      } finally {
        setActiveGeneratingTokenId(null);
      }
    },
    [generateToken, mutate, posthog]
  );

  const handleEditClient = useCallback((client: TableClient) => {
    setEditDialogState({
      isOpen: true,
      client: client,
    });
  }, []);

  const renderStatus = useCallback((value: unknown, item: TableClient) => {
    // Determine token expired status (prefer server-provided status)
    const token = item.access_token;
    let expired = false;
    if (token) {
      expired = token.token_status === 'expired';
      if (!expired && token.expires) {
        const expiryDate = parseDate(token.expires);
        if (expiryDate) expired = expiryDate.getTime() <= Date.now();
      }
    }

    if (expired) {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
          Expired
        </span>
      );
    }

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

  const renderTokenStatus = useCallback(
    (value: unknown, item: TableClient) => {
      const token = item.access_token;

      if (token) {
        // Determine expired state: prefer server-provided token_status, otherwise infer from expiry date
        let expired = token.token_status === 'expired';
        if (!expired && token.expires) {
          const expiryDate = parseDate(token.expires);
          if (expiryDate) expired = expiryDate.getTime() <= Date.now();
        }

        // Only display token details in this column; action buttons live in Actions column now
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <TokenDisplay
                token={token.token}
                expiresAt={token.expires}
                tokenStatus={token.token_status}
                showStatusBadge={false}
              />
            </div>
          </div>
        );
      }

      const isGeneratingForThis =
        isGeneratingToken && activeGeneratingTokenId === item._id;

      return (
        <Button
          size="sm"
          variant="outlined"
          onClick={() => handleGenerateToken(item, 'generate')}
          disabled={isGeneratingForThis}
        >
          {isGeneratingForThis ? 'Generating...' : 'Generate Token'}
        </Button>
      );
    },
    [isGeneratingToken, handleGenerateToken, activeGeneratingTokenId]
  );

  const renderCreatedDate = useCallback((value: unknown, item: TableClient) => {
    if (item.access_token?.createdAt) {
      return (
        <span className="whitespace-nowrap">
          {formatDate(item.access_token.createdAt, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );
    }
    return '-';
  }, []);

  const renderIPs = useCallback((value: unknown, item: TableClient) => {
    const ips = item.ip_addresses || [];
    if (!ips.length) return <span className="text-sm text-gray-500">-</span>;

    // Show up to 2 IPs, then indicate if more
    const visible = ips.slice(0, 2);
    const more = ips.length - visible.length;

    return (
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <div className="flex gap-2 items-center flex-wrap">
          {visible.map(ip => (
            <span
              key={ip}
              className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-xs border"
            >
              {ip}
            </span>
          ))}
          {more > 0 && (
            <span className="text-xs text-gray-500">+{more} more</span>
          )}
        </div>
      </div>
    );
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
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
        key: 'ip_addresses',
        label: 'IP Addresses',
        sortable: false,
        render: renderIPs,
      },
      {
        key: 'access_token',
        label: 'Access Token',
        sortable: false,
        render: renderTokenStatus,
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        render: (value: unknown, item: TableClient) => {
          const token = item.access_token;
          let expired = false;
          if (token) {
            expired = token.token_status === 'expired';
            if (!expired && token.expires) {
              const expiryDate = parseDate(token.expires);
              if (expiryDate) expired = expiryDate.getTime() <= Date.now();
            }
          }

          const isGeneratingForThis =
            isGeneratingToken && activeGeneratingTokenId === item._id;

          if (token && expired && item.isActive) {
            return (
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleGenerateToken(item, 'refresh')}
                disabled={isGeneratingForThis}
              >
                {isGeneratingForThis ? 'Refreshing...' : 'Refresh'}
              </Button>
            );
          }

          return (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditClient(item)}
              className="p-1 h-6 w-6"
            >
              <AqEdit05 className="w-4 h-4" />
            </Button>
          );
        },
      },
    ],
    [
      renderStatus,
      renderTokenStatus,
      renderCreatedDate,
      renderIPs,
      handleEditClient,
      isGeneratingToken,
      activeGeneratingTokenId,
      handleGenerateToken,
    ]
  );

  return (
    <div className="space-y-6">
      <UsageStats />

      {/* API Clients Table */}
      <MultiSelectTable
        title="API Clients"
        data={tableData}
        columns={columns}
        searchable={true}
        sortable={true}
        showPagination={true}
        pageSize={10}
        loading={isLoading}
        headerComponent={
          <div className="flex gap-2 justify-between items-center w-full">
            <div className="md:max-w-[640px] w-full">
              <PageHeading
                title="API access tokens"
                subtitle="Clients are used to generate API tokens that can be used to authenticate with the API. Your secret API tokens are listed below. Remember to keep them secure and never share them."
                className="mb-0"
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.airqo.net/airqo-rest-api-documentation"
                  className="text-blue-600"
                  aria-label="Read AirQo REST API Documentation"
                >
                  Read Docs
                </a>
              </PageHeading>
            </div>
            <Button
              Icon={AqPlus}
              size="lg"
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Client
            </Button>
          </div>
        }
      />

      {/* Inactive Client Dialog */}
      <InactiveClientDialog
        isOpen={inactiveDialogState.isOpen}
        onClose={() =>
          setInactiveDialogState({
            isOpen: false,
            clientId: '',
            clientName: '',
          })
        }
        clientId={inactiveDialogState.clientId}
        clientName={inactiveDialogState.clientName}
      />

      {/* Create Client Dialog */}
      <CreateClientDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          mutate();
        }}
        userId={userId}
      />

      {/* Edit Client Dialog */}
      {editDialogState.client && (
        <EditClientDialog
          isOpen={editDialogState.isOpen}
          onClose={() =>
            setEditDialogState({
              isOpen: false,
              client: null,
            })
          }
          client={editDialogState.client}
          onSuccess={() => {
            setEditDialogState({ isOpen: false, client: null });
            mutate();
          }}
        />
      )}
    </div>
  );
};

export default ApiClientPage;
