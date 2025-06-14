import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ApiTableSkeleton from './ApiTableSkeleton';
import moment from 'moment';
import { getUserDetails } from '@/core/apis/Account';
import EditIcon from '@/icons/Common/edit-pencil.svg';
import { useSelector, useDispatch } from 'react-redux';
import Toast from '@/components/Toast';
import {
  addClients,
  addClientsDetails,
  performRefresh,
} from '@/lib/store/services/apiClient';
import EditClientForm from './EditClientForm';
import {
  generateTokenApi,
  getClientsApi,
  activationRequestApi,
} from '@/core/apis/Settings';
import Button from '@/components/Button';
import { isEmpty } from 'underscore';
import CopyIcon from '@/icons/Common/copy.svg';
import DialogWrapper from '@/components/Modal/DialogWrapper';
import InfoCircleIcon from '@/icons/Common/info_circle.svg';
import Pagination from '@/components/Collocation/AddMonitor/Table/Pagination';
import Card from '@/components/CardWrapper';

const UserClientsTable = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [isActivationRequestError, setIsActivationRequestError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isLoadingActivationRequest, setIsLoadingActivationRequest] =
    useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const userInfo = useSelector((state) => state.login.userInfo);
  const clients = useSelector((state) => state.apiClient.clients);
  const clientsDetails = useSelector((state) => state.apiClient.clientsDetails);
  const refresh = useSelector((state) => state.apiClient.refresh);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Get user ID from session with fallback to Redux state
  const userId = session?.user?.id || userInfo?.id || userInfo?._id;

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const setErrorState = (message, type) => {
    setIsError({
      isError: true,
      message,
      type,
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user details and clients in parallel
        const [userDetailsRes, clientsDetailsRes] = await Promise.allSettled([
          getUserDetails(userId),
          getClientsApi(userId),
        ]);

        // Handle user details response
        if (
          userDetailsRes.status === 'fulfilled' &&
          userDetailsRes.value.success
        ) {
          dispatch(addClients(userDetailsRes.value.users[0].clients));
          setCurrentPage(1);
        }

        // Handle clients details response
        if (
          clientsDetailsRes.status === 'fulfilled' &&
          clientsDetailsRes.value.success
        ) {
          dispatch(addClientsDetails(clientsDetailsRes.value.clients));
        } else if (
          clientsDetailsRes.status === 'rejected' &&
          clientsDetailsRes.reason?.response?.status === 404 &&
          clientsDetailsRes.reason?.response?.data?.success === true &&
          clientsDetailsRes.reason?.response?.data?.message ===
            'no clients exist'
        ) {
          // Handle "no clients exist" as a successful response with empty clients array
          dispatch(addClientsDetails([]));
        }
      } catch (error) {
        setErrorState(error?.message || 'Failed to fetch data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [refresh, userId, dispatch]);

  const hasAccessToken = (clientId) => {
    const client =
      Array.isArray(clientsDetails) && !isEmpty(clientsDetails)
        ? clientsDetails.find((client) => client._id === clientId)
        : null;
    return client && client.access_token;
  };

  const getClientToken = (clientID) => {
    const client =
      Array.isArray(clientsDetails) && !isEmpty(clientsDetails)
        ? clientsDetails.find((client) => client._id === clientID)
        : null;
    return client && client.access_token && client.access_token.token;
  };

  const getClientTokenExpiryDate = (clientID) => {
    const client =
      Array.isArray(clientsDetails) && !isEmpty(clientsDetails)
        ? clientsDetails.find((client) => client._id === clientID)
        : null;
    return client && client.access_token && client.access_token.expires;
  };

  const handleGenerateToken = async (clientData) => {
    setIsLoadingToken(true);
    if (!clientData?.isActive) {
      setShowInfoModal(true);
      setIsLoadingToken(false);
    } else {
      try {
        const response = await generateTokenApi(clientData);
        if (response.success) {
          setErrorState('Token generated', 'success');
        }
        dispatch(performRefresh());
      } catch (error) {
        setErrorState(error.message, 'error');
      } finally {
        setIsLoadingToken(false);
      }
    }
  };

  const handleActivationRequest = async () => {
    const setActivationRequestErrorState = (message, type) => {
      setIsActivationRequestError({
        isError: true,
        message,
        type,
      });
    };
    setIsLoadingActivationRequest(true);
    try {
      const clientID = selectedClient?._id;
      const response = await activationRequestApi(clientID);
      if (response.success) {
        setShowInfoModal(false);
        setTimeout(() => {
          setActivationRequestErrorState(
            'Activation request sent successfully',
            'success',
          );
        }, 3000);
      }
    } catch (error) {
      setShowInfoModal(false);
      setTimeout(() => {
        setActivationRequestErrorState(error.message, 'error');
      }, 3000);
    } finally {
      setIsLoadingActivationRequest(false);
    }
  };

  const displayIPAddresses = (client) =>
    Array.isArray(client.ip_addresses)
      ? client.ip_addresses.join(', ')
      : client.ip_addresses;

  return (
    <Card padding="p-0" bordered={false} rounded={false} className="mb-2 ">
      {isError.isError && (
        <Toast type={isError.type} message={isError.message} />
      )}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse rounded-lg text-xs text-left mb-6 dark:text-gray-100"
          data-testid="settings-clients-table"
        >
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
              <th className="w-[200px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Client name
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                IP Address
              </th>
              <th className="w-[142px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Client Status
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Created
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Token
              </th>
              <th className="w-[138px] px-4 py-3 text-gray-600 dark:text-gray-300 opacity-90">
                Expires
              </th>
              <th className="w-24 px-4 py-3 opacity-90"></th>
            </tr>
          </thead>
          {isLoading ? (
            <ApiTableSkeleton rows={4} />
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
                        {client?.name}
                      </td>
                      <td className="w-[138px] px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300">
                        {displayIPAddresses(client)}
                      </td>
                      <td className="w-[142px] px-4 py-3">
                        <div
                          className={`px-2 py-[2px] rounded-2xl inline-flex justify-center text-sm items-center mx-auto ${
                            client?.isActive
                              ? 'bg-green-100 dark:bg-green-800/40 dark:text-green-400 text-green-700'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {client?.isActive ? 'Activated' : 'Not Activated'}
                        </div>
                      </td>
                      <td className="w-[138px] px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300">
                        {moment(client?.createdAt).format('MMM DD, YYYY')}
                      </td>
                      <td className="w-[138px] px-4 py-3">
                        {getClientToken(client._id) ? (
                          <span className="font-medium text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
                            {getClientToken(client._id).slice(0, 2)}....
                            {getClientToken(client._id).slice(-2)}
                            <div
                              className="w-6 h-6 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  getClientToken(client._id),
                                );
                                setErrorState(
                                  'Token copied to clipboard!',
                                  'success',
                                );
                              }}
                            >
                              <CopyIcon />
                            </div>
                          </span>
                        ) : (
                          <Button
                            title={
                              !client?.isActive
                                ? 'Tap to generate token'
                                : 'Token already generated'
                            }
                            className={`px-4 py-2 rounded-2xl inline-flex justify-center items-center text-sm ${
                              !hasAccessToken(client._id)
                                ? 'bg-green-700 text-green-50 cursor-pointer'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                            disabled={isLoadingToken}
                            onClick={() => {
                              const clientData = {
                                name: client.name,
                                client_id: client._id,
                                isActive: !!client.isActive,
                              };
                              setSelectedClient(client);
                              handleGenerateToken(clientData);
                            }}
                          >
                            Generate
                          </Button>
                        )}
                      </td>
                      <td className="w-[138px] px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300">
                        {getClientTokenExpiryDate(client._id) &&
                          moment(getClientTokenExpiryDate(client._id)).format(
                            'MMM DD, YYYY',
                          )}
                      </td>
                      <td className="w-24 px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-300 capitalize">
                        <div
                          className="w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center cursor-pointer"
                          onClick={() => {
                            setOpenEditForm(true);
                            setSelectedClient(client);
                          }}
                        >
                          <EditIcon className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
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
        totalItems={clients?.length}
        onPrevClick={() => onPageChange(currentPage - 1)}
        onNextClick={() => onPageChange(currentPage + 1)}
      />
      {isActivationRequestError.isError && (
        <Toast
          type={isActivationRequestError.type}
          message={isActivationRequestError.message}
        />
      )}
      <EditClientForm
        open={openEditForm}
        closeModal={() => setOpenEditForm(false)}
        data={selectedClient}
      />
      <DialogWrapper
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        handleClick={handleActivationRequest}
        primaryButtonText="Send activation request"
        loading={isLoadingActivationRequest}
        ModalIcon={InfoCircleIcon}
      >
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          You cannot generate a token for an inactive client. Reach out to
          support for assistance at support@airqo.net or send an activation
          request.
        </div>
      </DialogWrapper>
    </Card>
  );
};

export default UserClientsTable;
