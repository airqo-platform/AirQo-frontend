import { useEffect, useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import moment from 'moment';
import { getUserDetails } from '@/core/apis/Account';
import EditIcon from '@/icons/Common/edit-pencil.svg';
import { useSelector } from 'react-redux';
import Toast from '@/components/Toast';
import {
  addClients,
  addClientsDetails,
  performRefresh,
} from '@/lib/store/services/apiClient';
import { useDispatch } from 'react-redux';
import EditClientForm from './EditClientForm';
import {
  generateTokenApi,
  getClientsApi,
  activationRequestApi,
} from '@/core/apis/Settings';
import Button from '@/components/Button';
import { isEmpty } from 'underscore';
import CopyIcon from '@/icons/Common/copy.svg';
import DialogWrapper from '../../Modal/DialogWrapper';
import InfoCircleIcon from '@/icons/Common/info_circle.svg';
import Pagination from '../../Collocation/AddMonitor/Table/Pagination';

const UserClientsTable = () => {
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
  const [isLoading, setIsLoading] = useState(false);
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getUserDetails(userInfo?._id);
        if (res.success === true) {
          dispatch(addClients(res.users[0].clients));
          setCurrentPage(1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getClientsApi(userInfo?._id);
        if (response.success === true) {
          dispatch(addClientsDetails(response.clients));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const hasAccessToken = (clientId) => {
    const client =
      Array.isArray(clientsDetails) && !isEmpty(clientsDetails)
        ? clientsDetails?.find((client) => client._id === clientId)
        : [];
    return client && client.access_token;
  };

  const getClientToken = (clientID) => {
    const client =
      Array.isArray(clientsDetails) && !isEmpty(clientsDetails)
        ? clientsDetails?.find((client) => client._id === clientID)
        : [];
    return client && client.access_token && client.access_token.token;
  };

  const getClientTokenExpiryDate = (clientID) => {
    const client =
      Array.isArray(clientsDetails) && !isEmpty(clientsDetails)
        ? clientsDetails?.find((client) => client._id === clientID)
        : [];
    return client && client.access_token && client.access_token.expires;
  };

  const handleGenerateToken = async (res) => {
    setIsLoadingToken(true);
    if (!res?.isActive) {
      setShowInfoModal(true);
      setIsLoadingToken(false);
    } else {
      try {
        const response = await generateTokenApi(res);
        if (response.success === true) {
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
      if (response.success === true) {
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

  const displayIPAddresses = (client) => {
    return Array.isArray(client.ip_addresses)
      ? client.ip_addresses.join(', ')
      : client.ip_addresses;
  };

  return (
    <div className="overflow-x-scroll">
      {isError.isError && (
        <Toast type={isError.type} message={isError.message} />
      )}
      <table
        className="border-collapse rounded-lg text-xs text-left w-full mb-6"
        data-testid="settings-clients-table"
      >
        <thead>
          <tr className="text-secondary-neutral-light-500 text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25">
            <th
              scope="col"
              className="font-medium w-[200px] px-4 py-3 opacity-40"
            >
              Client name
            </th>
            <th
              scope="col"
              className="font-medium w-[138px] px-4 py-3 opacity-40"
            >
              IP Address
            </th>
            <th
              scope="col"
              className="font-medium w-[142px] px-4 py-3 opacity-40"
            >
              Client Status
            </th>
            <th
              scope="col"
              className="font-medium w-[138px] px-4 py-3 opacity-40"
            >
              Created
            </th>
            <th
              scope="col"
              className="font-medium w-[138px] px-4 py-3 opacity-40"
            >
              Token
            </th>
            <th
              scope="col"
              className="font-medium w-[138px] px-4 py-3 opacity-40"
            >
              Expires
            </th>
            <th
              scope="col"
              className="font-medium w-24 px-4 py-3 opacity-40"
            ></th>
          </tr>
        </thead>

        {isLoading ? (
          <Skeleton />
        ) : (
          <tbody>
            {clients?.length > 0 ? (
              clients
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((client, index) => {
                  return (
                    <tr
                      className={`border-b border-b-secondary-neutral-light-100`}
                      key={index}
                    >
                      <td
                        scope="row"
                        className="w-[200px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-800 uppercase"
                      >
                        {client?.name}
                      </td>
                      <td
                        scope="row"
                        className="w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400"
                      >
                        {displayIPAddresses(client)}
                      </td>
                      <td scope="row" className="w-[142px] px-4 py-3">
                        <div
                          className={`px-2 py-[2px] rounded-2xl w-auto inline-flex justify-center text-sm leading-5 items-center mx-auto ${
                            client?.isActive
                              ? 'bg-success-50 text-success-700'
                              : 'bg-secondary-neutral-light-50 text-secondary-neutral-light-500'
                          }`}
                        >
                          {client?.isActive ? 'Activated' : 'Not Activated'}
                        </div>
                      </td>
                      <td
                        scope="row"
                        className="w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400"
                      >
                        {moment(client?.createdAt).format('MMM DD, YYYY')}
                      </td>
                      <td scope="row" className="w-[138px] px-4 py-3">
                        {getClientToken(client._id) ? (
                          <span className="font-medium text-sm leading-5 text-secondary-neutral-light-400 flex items-center gap-2">
                            {getClientToken(client._id).slice(0, 2)}....
                            {getClientToken(client._id).slice(-2)}
                            <div
                              className="w-6 h-6 bg-white rounded border border-gray-200 flex justify-center items-center gap-2 cursor-pointer"
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
                            className={`px-4 py-2 rounded-2xl w-auto inline-flex justify-center text-sm leading-5 items-center mx-auto ${
                              !hasAccessToken(client._id)
                                ? 'bg-success-700 text-success-50 cursor-pointer'
                                : 'bg-secondary-neutral-light-50 text-secondary-neutral-light-500'
                            }`}
                            disabled={isLoadingToken}
                            onClick={() => {
                              let res = {
                                name: client.name,
                                client_id: client._id,
                                isActive: client.isActive
                                  ? client.isActive
                                  : false,
                              };
                              setSelectedClient(client);
                              handleGenerateToken(res);
                            }}
                          >
                            Generate
                          </Button>
                        )}
                      </td>
                      <td
                        scope="row"
                        className="w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400"
                      >
                        {getClientTokenExpiryDate(client._id) &&
                          moment(getClientTokenExpiryDate(client._id)).format(
                            'MMM DD, YYYY',
                          )}
                      </td>
                      <td
                        scope="row"
                        className="w-24 px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400 capitalize"
                      >
                        <div
                          className="w-9 h-9 p-2.5 bg-white rounded border border-gray-200 justify-center items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setOpenEditForm(true);
                            setSelectedClient(client);
                          }}
                        >
                          <EditIcon className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-3 text-grey-300">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
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
        primaryButtonText={'Send activation request'}
        loading={isLoadingActivationRequest}
        ModalIcon={InfoCircleIcon}
      >
        <div className="text-slate-500 text-sm font-normal leading-tight">
          You cannot generate a token for an inactive client, reach out to
          support for assistance at support@airqo.net or send an activation
          request
        </div>
      </DialogWrapper>
    </div>
  );
};

export default UserClientsTable;
