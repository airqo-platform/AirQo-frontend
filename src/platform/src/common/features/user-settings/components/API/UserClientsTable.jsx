import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import { getUserDetails } from '@/core/apis/Account';
import { AqEdit05 } from '@airqo/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import CustomToast from '@/common/components/Toast/CustomToast';
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
import { AqCopy03, AqInfoCircle, AqPlus } from '@airqo/icons-react';
import ReusableDialog from '@/components/Modal/ReusableDialog';
import AddClientForm from './AddClientForm';
import ReusableTable from '@/common/components/Table/ReusableTable';

const UserClientsTable = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isLoadingActivationRequest, setIsLoadingActivationRequest] =
    useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const userInfo = useSelector((state) => state.login.userInfo);
  const clients = useSelector((state) => state.apiClient.clients);
  const clientsDetails = useSelector((state) => state.apiClient.clientsDetails);
  const refresh = useSelector((state) => state.apiClient.refresh);
  const itemsPerPage = 4;

  // Get user ID from session with fallback to Redux state
  const userId = session?.user?.id || userInfo?.id || userInfo?._id;

  const setErrorState = (message, type) => {
    setIsError({
      isError: true,
      message,
      type,
    });
  };

  // Show toast when isError changes
  useEffect(() => {
    if (isError.isError) {
      CustomToast({ message: isError.message, type: isError.type });
      setIsError({ isError: false, message: '', type: '' });
    }
  }, [isError]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [userDetailsRes, clientsDetailsRes] = await Promise.allSettled([
          getUserDetails(userId),
          getClientsApi(userId),
        ]);
        if (
          userDetailsRes.status === 'fulfilled' &&
          userDetailsRes.value.success
        ) {
          dispatch(addClients(userDetailsRes.value.users[0].clients));
        }
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
    setIsLoadingActivationRequest(true);
    try {
      const clientID = selectedClient?._id;
      const response = await activationRequestApi(clientID);
      setShowInfoModal(false);
      if (response.success) {
        CustomToast({
          message: 'Activation request sent successfully',
          type: 'success',
        });
      } else {
        CustomToast({
          message: 'Failed to send activation request',
          type: 'error',
        });
      }
    } catch (error) {
      setShowInfoModal(false);
      CustomToast({
        message: error.message || 'Failed to send activation request',
        type: 'error',
      });
    } finally {
      setIsLoadingActivationRequest(false);
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
      label: 'Client Status',
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
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-300 font-medium text-sm">
          {moment(value).format('MMM DD, YYYY')}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'token',
      label: 'Token',
      render: (_, client) =>
        getClientToken(client._id) ? (
          <span className="font-medium text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
            {getClientToken(client._id).slice(0, 2)}....
            {getClientToken(client._id).slice(-2)}
            <div
              className="w-6 h-6 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(getClientToken(client._id));
                setErrorState('Token copied to clipboard!', 'success');
              }}
            >
              <AqCopy03 size={16} />
            </div>
          </span>
        ) : (
          <Button
            title={
              !client?.isActive
                ? 'Tap to generate token'
                : 'Token already generated'
            }
            variant={!hasAccessToken(client._id) ? 'filled' : 'disabled'}
            className="px-4 py-2 rounded-2xl inline-flex justify-center items-center text-sm"
            disabled={isLoadingToken || hasAccessToken(client._id)}
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
        ),
      sortable: false,
    },
    {
      key: 'expires',
      label: 'Expires',
      render: (_, client) =>
        getClientTokenExpiryDate(client._id) && (
          <span className="text-gray-500 dark:text-gray-300 font-medium text-sm">
            {moment(getClientTokenExpiryDate(client._id)).format(
              'MMM DD, YYYY',
            )}
          </span>
        ),
      sortable: true,
    },
    {
      key: 'edit',
      label: '',
      render: (_, client) => (
        <div
          className="w-9 h-9 p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex justify-center items-center cursor-pointer"
          onClick={() => {
            setOpenEditForm(true);
            setSelectedClient(client);
          }}
        >
          <AqEdit05 className="w-4 h-4" />
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
        { value: '', label: 'All' },
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
        searchable={true}
        filterable={true}
        filters={filters}
        pageSize={itemsPerPage}
        showPagination={true}
        sortable={true}
        className="text-xs"
        searchableColumns={['name', 'ip_addresses']}
        pageSizeOptions={[4, 8, 16, 32]}
        loading={isLoading}
        headerComponent={
          <div className="px-3 py-4 md:flex w-full border-b border-gray-200 dark:border-gray-800 justify-between items-center gap-5">
            <div>
              <h3 className="text-grey-710 dark:text-white font-medium text-lg">
                API access tokens
              </h3>
              <p className="text-grey-500 text-sm md:max-w-[640px] w-full">
                Clients are used to generate API tokens that can be used to
                authenticate with the API. Your secret API tokens are listed
                below. Remember to keep them secure and never share them. <br />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.airqo.net/airqo-rest-api-documentation"
                  className="text-blue-600"
                  aria-label="Read AirQo REST API Documentation"
                >
                  Read Docs
                </a>
              </p>
            </div>
            <Button
              onClick={() => setOpenAddForm(true)}
              className="w-[152px] h-11 flex justify-center items-center gap-2 rounded py-3 px-4 mr-5 my-4 md:mb-0 text-sm font-medium"
            >
              <AqPlus /> Create client
            </Button>
          </div>
        }
      />

      <EditClientForm
        open={openEditForm}
        closeModal={() => setOpenEditForm(false)}
        data={selectedClient}
      />
      <AddClientForm
        open={openAddForm}
        closeModal={() => setOpenAddForm(false)}
      />
      <ReusableDialog
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Activation Required"
        icon={AqInfoCircle}
        showFooter={true}
        primaryAction={{
          label: 'Send activation request',
          onClick: handleActivationRequest,
          disabled: isLoadingActivationRequest,
          className: isLoadingActivationRequest
            ? 'opacity-60 pointer-events-none'
            : '',
        }}
      >
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          You cannot generate a token for an inactive client. Reach out to
          support for assistance at support@airqo.net or send an activation
          request.
        </div>
      </ReusableDialog>
    </div>
  );
};

export default UserClientsTable;
