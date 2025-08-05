import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReusableTable from '@/common/components/Table/ReusableTable';
import { AqXClose, AqCheckDone01 } from '@airqo/icons-react';
import CustomToast from '@/common/components/Toast/CustomToast';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import {
  getAllUserClientsApi,
  activateUserClientApi,
} from '@/core/apis/Settings';
import { performRefresh } from '@/lib/store/services/apiClient';

const AdminClientsTable = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivation, setIsLoadingActivation] = useState(false);
  const [isLoadingDeactivation, setIsLoadingDeactivation] = useState(false);
  const [confirmActivation, setConfirmActivation] = useState(false);
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const my_clients = useSelector((state) => state.apiClient.clients);
  const refresh = useSelector((state) => state.apiClient.refresh);

  // Fetch and normalize clients
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getAllUserClientsApi();
        if (res.success) {
          // Ensure each client has an 'id' property for ReusableTable
          const normalized = res.clients.map((c) => ({ ...c, id: c._id }));
          setClients(normalized);
        }
      } catch {
        CustomToast({ type: 'error', message: 'Failed to fetch clients' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refresh, my_clients]);

  // Notification helper
  const notify = (message, type) => CustomToast({ type, message });

  // Activate client
  const handleActivate = async () => {
    if (!selectedClient) return;
    setIsLoadingActivation(true);
    try {
      await activateUserClientApi({ _id: selectedClient._id, isActive: true });
      notify('Client activated successfully', 'success');
      dispatch(performRefresh());
    } catch {
      notify('Failed to activate client', 'error');
    } finally {
      setIsLoadingActivation(false);
      setConfirmActivation(false);
    }
  };

  // Deactivate client
  const handleDeactivate = async () => {
    if (!selectedClient) return;
    setIsLoadingDeactivation(true);
    try {
      await activateUserClientApi({ _id: selectedClient._id, isActive: false });
      notify('Client deactivated successfully', 'success');
      dispatch(performRefresh());
    } catch {
      notify('Failed to deactivate client', 'error');
    } finally {
      setIsLoadingDeactivation(false);
      setConfirmDeactivation(false);
      setSelectedClient(null);
    }
  };

  // Table columns definition
  const columns = [
    {
      key: 'name',
      label: 'Client Name',
      render: (value) => (
        <span className="uppercase text-gray-800 dark:text-gray-100 font-medium text-sm">
          {value}
        </span>
      ),
      sortable: true,
    },
    {
      key: '_id',
      label: 'Client ID',
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-300 font-medium text-sm">
          {value}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'ip_addresses',
      label: 'IP Address',
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-300 font-medium text-sm">
          {Array.isArray(value) ? value.join(', ') : value}
        </span>
      ),
      sortable: false,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <div
          className={`px-2 py-[2px] rounded-2xl inline-flex justify-center text-sm items-center mx-auto ${value ? 'bg-green-100 dark:bg-green-800/40 dark:text-green-400 text-green-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'}`}
        >
          {value ? 'Activated' : 'Not Activated'}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, client) => (
        <div className="flex items-center gap-2">
          <button
            className={`w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center ${client.isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={() => {
              if (!client.isActive) {
                setConfirmActivation(true);
                setSelectedClient(client);
              }
            }}
            title={
              client.isActive
                ? 'Client is already activated'
                : 'Activate client'
            }
            disabled={client.isActive}
            type="button"
          >
            <AqCheckDone01 />
          </button>
          <button
            className={`w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center ${client.isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            onClick={() => {
              if (client.isActive) {
                setConfirmDeactivation(true);
                setSelectedClient(client);
              }
            }}
            title={
              !client.isActive
                ? 'Client is already deactivated'
                : 'Deactivate client'
            }
            disabled={!client.isActive}
            type="button"
          >
            <AqXClose />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  // Status filter options
  const filters = [
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { value: true, label: 'Activated' },
        { value: false, label: 'Not Activated' },
      ],
      placeholder: 'Filter by status',
      isMulti: false,
    },
  ];

  return (
    <div className="mb-2">
      <ReusableTable
        title="API Clients"
        data={clients}
        columns={columns}
        searchable
        filterable
        filters={filters}
        pageSize={8}
        showPagination
        sortable
        className="text-xs"
        searchableColumns={['name', '_id', 'ip_addresses']}
        pageSizeOptions={[8, 16, 32, 64]}
        loading={isLoading}
        headerComponent={
          <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-710 dark:text-white font-medium text-lg">
              Clients Activation Manager
            </h3>
            <p className="text-gray-500 text-sm md:max-w-[640px] w-full">
              Activate or deactivate clients to enable or disable their access
              to the API.
            </p>
          </div>
        }
      />
      {/* Activation Dialog */}
      <ReusableDialog
        isOpen={confirmActivation}
        onClose={() => setConfirmActivation(false)}
        title="Activate client"
        showFooter
        primaryAction={{
          label: isLoadingActivation ? 'Activating...' : 'Activate',
          onClick: handleActivate,
          disabled: isLoadingActivation,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setConfirmActivation(false),
          disabled: isLoadingActivation,
          variant: 'outlined',
        }}
        size="md"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {`Are you sure you want to activate ${selectedClient?.name ?? ''} client?`}
        </p>
      </ReusableDialog>
      {/* Deactivation Dialog */}
      <ReusableDialog
        isOpen={confirmDeactivation}
        onClose={() => setConfirmDeactivation(false)}
        title="Deactivate client"
        showFooter
        primaryAction={{
          label: isLoadingDeactivation ? 'Deactivating...' : 'Deactivate',
          onClick: handleDeactivate,
          disabled: isLoadingDeactivation,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setConfirmDeactivation(false),
          disabled: isLoadingDeactivation,
          variant: 'outlined',
        }}
        size="md"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {`Are you sure you want to deactivate ${selectedClient?.name ?? ''} client?`}
        </p>
      </ReusableDialog>
    </div>
  );
};

export default AdminClientsTable;
