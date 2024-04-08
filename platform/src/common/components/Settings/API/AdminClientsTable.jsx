import { useEffect, useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import CloseIcon from '@/icons/close_icon';
import CheckIcon from '@/icons/tickIcon';
import Toast from '@/components/Toast';
import { useDispatch } from 'react-redux';
import { getAllUserClientsApi } from '@/core/apis/Settings';
import Pagination from '../../Collocation/AddMonitor/Table/Pagination';

const AdminClientsTable = () => {
  const dispatch = useDispatch();
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getAllUserClientsApi();
        if (res.success === true) {
          setClients(res.clients);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <div className='overflow-x-scroll'>
        {isError.isError && <Toast type={isError.type} message={isError.message} />}
        <table
          className='border-collapse rounded-lg text-xs text-left w-full mb-6'
          data-testid='settings-clients-table'
        >
          <thead>
            <tr className='text-secondary-neutral-light-500 text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25'>
              <th scope='col' className='font-medium w-[200px] px-4 py-3 opacity-40'>
                Client name
              </th>
              <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
                Client ID
              </th>
              <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
                IP Address
              </th>
              <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
                Status
              </th>
              <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
                Action
              </th>
            </tr>
          </thead>

          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {clients && clients.length > 0 ? (
                clients
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((client, index) => {
                    return (
                      <tr className={`border-b border-b-secondary-neutral-light-100`} key={index}>
                        <td
                          scope='row'
                          className='w-[200px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-800 uppercase'
                        >
                          {client?.name}
                        </td>
                        <td
                          scope='row'
                          className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                        >
                          {client?._id}
                        </td>
                        <td
                          scope='row'
                          className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                        >
                          {client?.ip_address}
                        </td>
                        <td scope='row' className='w-[138px] px-4 py-3'>
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
                          scope='row'
                          className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400 capitalize flex items-center gap-2'
                        >
                          <div
                            className='w-9 h-9 p-2.5 bg-white rounded border border-gray-200 flex justify-center items-center cursor-pointer'
                            onClick={() => {
                              setOpenEditForm(true);
                              setSelectedClient(client);
                            }}
                          >
                            <CheckIcon />
                          </div>
                          <div
                            className='w-9 h-9 p-2.5 bg-white rounded border border-gray-200 flex justify-center items-center cursor-pointer'
                            onClick={() => {
                              setOpenEditForm(true);
                              setSelectedClient(client);
                            }}
                          >
                            <CloseIcon />
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan='6' className='text-center py-3 text-grey-300'>
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
    </div>
  );
};

export default AdminClientsTable;
