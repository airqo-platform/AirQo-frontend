import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '@/components/CardWrapper';
import AdminApiTableSkeleton from './AdminApiTableSkeleton';
import CloseIcon from '@/icons/close_icon';
import CheckIcon from '@/icons/tickIcon';
import Toast from '@/components/Toast';
import Pagination from '@/components/Collocation/AddMonitor/Table/Pagination';
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
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [isLoadingActivation, setIsLoadingActivation] = useState(false);
  const [isLoadingDeactivation, setIsLoadingDeactivation] = useState(false);
  const [confirmActivation, setConfirmActivation] = useState(false);
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const my_clients = useSelector((state) => state.apiClient.clients);
  const refresh = useSelector((state) => state.apiClient.refresh);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getAllUserClientsApi();
        if (res.success) {
          setClients(res.clients);
          setCurrentPage(1);
        }
      } catch {
        setError('Failed to fetch clients', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refresh, my_clients]);

  const onPageChange = (newPage) => setCurrentPage(newPage);

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

  const displayIPAddresses = (client) =>
    Array.isArray(client.ip_addresses)
      ? client.ip_addresses.join(', ')
      : client.ip_addresses;

  return (
    <Card padding="p-0" bordered={false} rounded={false} className="mb-2 ">
      {errorState.isError && (
        <Toast type={errorState.type} message={errorState.message} />
      )}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse rounded-lg text-xs text-left mb-6"
          data-testid="settings-clients-table"
        >
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
              <th className="w-[200px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Client name
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Client ID
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                IP Address
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Status
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Action
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <AdminApiTableSkeleton rows={8} />
          ) : (
            <tbody>
              {clients?.length > 0 ? (
                clients
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((client, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="w-[200px] px-4 py-3 font-medium text-sm text-gray-800 dark:text-gray-100 uppercase">
                        {client.name}
                      </td>
                      <td className="w-[138px] px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300">
                        {client._id}
                      </td>
                      <td className="w-[138px] px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300">
                        {displayIPAddresses(client)}
                      </td>
                      <td className="w-[138px] px-4 py-3">
                        <div
                          className={`px-2 py-[2px] rounded-2xl inline-flex justify-center text-sm items-center mx-auto ${
                            client.isActive
                              ? 'bg-green-100 dark:bg-green-800/40 dark:text-green-400 text-green-700'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {client.isActive ? 'Activated' : 'Not Activated'}
                        </div>
                      </td>
                      <td className="w-[138px] px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300 capitalize flex items-center gap-2">
                        <div
                          className={`w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center ${
                            client.isActive
                              ? 'cursor-not-allowed'
                              : 'cursor-pointer'
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
                            client.isActive
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed'
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
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-3 text-gray-400 dark:text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        pageSize={itemsPerPage}
        totalItems={clients.length}
        onPrevClick={() => onPageChange(currentPage - 1)}
        onNextClick={() => onPageChange(currentPage + 1)}
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
    </Card>
  );
};

export default AdminClientsTable;
