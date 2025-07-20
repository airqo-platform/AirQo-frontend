import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReusableTable from '@/common/components/Table/ReusableTable';
import CloseIcon from '@/icons/close_icon';
import CheckIcon from '@/icons/tickIcon';
import Toast from '@/components/Toast';
import DialogWrapper from '@/components/Modal/DialogWrapper';
import {
  getAllUserClientsApi,
  activateUserClientApi,
} from '@/core/apis/Settings';
import { performRefresh } from '@/lib/store/services/apiClient';

const AdminClientsTable = () => {
  const dispatch = useDispatch();
  const [errorState, setErrorState] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivation, setIsLoadingActivation] = useState(false);
  const [isLoadingDeactivation, setIsLoadingDeactivation] = useState(false);
  const [confirmActivation, setConfirmActivation] = useState(false);
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const my_clients = useSelector((state) => state.apiClient.clients);
  const refresh = useSelector((state) => state.apiClient.refresh);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getAllUserClientsApi();
        if (res.success) {
          setClients(res.clients);
        }
      } catch {
        setError('Failed to fetch clients', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refresh, my_clients]);

  const setError = (message, type) =>
    setErrorState({ isError: true, message, type });

  const handleActivate = async () => {
    setIsLoadingActivation(true);
    const data = { _id: selectedClient._id, isActive: true };
    try {
      await activateUserClientApi(data);
      setError('Client activated successfully', 'success');
      dispatch(performRefresh());
    } catch {
      setError('Failed to activate client', 'error');
    } finally {
      setIsLoadingActivation(false);
      setConfirmActivation(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoadingDeactivation(true);
    const data = { _id: selectedClient._id, isActive: false };
    try {
      await activateUserClientApi(data);
      setError('Client deactivated successfully', 'success');
      dispatch(performRefresh());
    } catch {
      setError('Failed to deactivate client', 'error');
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
      label: 'Client name',
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
          className={`px-2 py-[2px] rounded-2xl inline-flex justify-center text-sm items-center mx-auto ${
            value
              ? 'bg-green-100 dark:bg-green-800/40 dark:text-green-400 text-green-700'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
          }`}
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
          <div
            className={`w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center ${
              client.isActive ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
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
          >
            <CheckIcon />
          </div>
          <div
            className={`w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center ${
              client.isActive ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
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
          >
            <CloseIcon />
          </div>
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
      {errorState.isError && (
        <Toast type={errorState.type} message={errorState.message} />
      )}
      <ReusableTable
        title="API Clients"
        data={clients}
        columns={columns}
        searchable={true}
        filterable={true}
        filters={filters}
        pageSize={8}
        showPagination={true}
        sortable={true}
        className="text-xs"
        searchableColumns={['name', '_id', 'ip_addresses']}
        pageSizeOptions={[8, 16, 32, 64]}
        loading={isLoading}
        headerComponent={
          <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-710 dark:text-white font-medium text-lg">
              Clients activation manager
            </h3>
            <p className="text-gray-500 text-sm md:max-w-[640px] w-full">
              Activate or deactivate clients to enable or disable their access
              to the API.
            </p>
          </div>
        }
      />
      <DialogWrapper
        open={confirmActivation}
        onClose={() => setConfirmActivation(false)}
        handleClick={handleActivate}
        primaryButtonText="Activate"
        loading={isLoadingActivation}
      >
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Activate client
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{`Are you sure you want to activate ${selectedClient?.name} client?`}</p>
      </DialogWrapper>
      <DialogWrapper
        open={confirmDeactivation}
        onClose={() => setConfirmDeactivation(false)}
        handleClick={handleDeactivate}
        primaryButtonText="Deactivate"
        loading={isLoadingDeactivation}
      >
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Deactivate client
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{`Are you sure you want to deactivate ${selectedClient?.name} client?`}</p>
      </DialogWrapper>
    </div>
  );
};

export default AdminClientsTable;
