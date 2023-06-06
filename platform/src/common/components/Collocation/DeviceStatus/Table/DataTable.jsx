import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addDevices,
  removeDevices,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
import Skeleton from './Skeleton';
import MoreHorizIcon from '@/icons/Common/more_horiz.svg';
import moment from 'moment';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';
import { useGetCollocationResultsQuery } from '@/lib/store/services/collocation';
import { isEmpty } from 'underscore';

// Dropdown menu
import Dropdown from '../../../Dropdowns/Dropdown';

// Modal notification
import Modal from '../../../Modal/Modal';

const STATUS_COLOR_CODES = {
  passed: 'bg-green-200',
  failed: 'bg-red-200',
  running: 'bg-turquoise-200',
  scheduled: 'bg-yellow-200',
  overdue: 'bg-red-200',
  re_run_required: 'bg-red-200',
};

const DataTable = ({ filteredData, collocationDevices, isLoading }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // state to handle modal visibility
  const [visible, setVisible] = useState(false);

  const [collocationInput, setCollocationInput] = useState({
    devices: null,
    batchId: '',
  });
  const [skip, setSkip] = useState(true);
  const [clickedRowIndex, setClickedRowIndex] = useState(null);

  const {
    isLoading: isCheckingForDataAvailability,
    isError,
    isSuccess,
    data: collocationBatchResults,
  } = useGetCollocationResultsQuery(collocationInput, { skip: skip });
  const collocationBatchResultsData = collocationBatchResults ? collocationBatchResults.data : [];

  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  useEffect(() => {
    if (selectedCollocateDevices.length > 0) {
      dispatch(removeDevices(collocationDevices));
    }
  }, []);

  const handleSelectAllDevices = (e) => {
    const allDevices = [];
    collocationDevices.map((device) => allDevices.push(device.device_name));
    if (e.target.checked) {
      dispatch(addDevices(allDevices));
    } else {
      dispatch(removeDevices(allDevices));
    }
  };

  const handleSelectDevice = (e, device) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      dispatch(addDevices([device.device_name]));
    } else {
      dispatch(removeDevices([device.device_name]));
    }
  };

  const openMonitorReport = async (deviceName, batchId, index) => {
    setCollocationInput({
      devices: deviceName,
      batchId: batchId,
    });
    setClickedRowIndex(index);
    setSkip(false);
  };

  // This function is to delete batch
  const deleteBatch = async () => {
    const { device, batchId } = collocationInput;

    console.log('device', device + ',' + 'batchId', batchId);

    // calling delete batch api
    // this is just my assumption, as i try to understand how the api works for the project
    // const { data } = await axios.delete(`/api/collocation/batch`, {
    //   device: device,
    //   batchId: batchId,
    // });

    // if (data.success) {
    //   setVisible(false);
    //   setCollocationInput({
    //     devices: null,
    //     batchId: '',
    //   });
    //   setSkip(true);
    // }
  };

  useEffect(() => {
    if (isSuccess && !isEmpty(collocationBatchResultsData)) {
      router.push({
        pathname: `/collocation/reports/${collocationInput.devices}`,
        query: {
          device: collocationInput.devices,
          batchId: collocationInput.batchId,
        },
      });
    }
  }, [isSuccess, collocationBatchResultsData, collocationInput]);

  // dropdown menu list
  const [menu, setMenu] = useState([
    {
      id: 1,
      name: 'View Reports',
    },
    {
      id: 2,
      name: 'Delete batch',
    },
  ]);

  const handleItemClick = (id, device, index) => {
    const { device_name, batch_id } = device;
    switch (id) {
      case 1:
        openMonitorReport(device_name, batch_id, index);
        break;
      case 2:
        setVisible(true);
        setCollocationInput({
          device: device_name,
          batchId: batch_id,
        });
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {isError && <Toast type={'error'} message='Uh-oh! Not enough data to generate a report' />}
      <table
        className='border-collapse text-xs text-left w-full mb-6'
        data-testid='collocation-device-status-summary'>
        <thead>
          <tr className='border-b border-b-slate-300 text-black'>
            <th scope='col' className='font-normal w-[61px] py-[10px] px-[21px]'>
              <input
                type='checkbox'
                checked={
                  collocationDevices.length > 0 &&
                  selectedCollocateDevices.length === collocationDevices.length
                }
                onChange={handleSelectAllDevices}
              />
            </th>
            <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
              Monitor name
            </th>
            <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
              Added by
            </th>
            <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
              Start date
            </th>
            <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
              End date
            </th>
            <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
              Status
            </th>
          </tr>
        </thead>

        {isLoading ? (
          <Skeleton />
        ) : (
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((device, index) => {
                return (
                  <tr
                    className={`border-b border-b-slate-300 ${
                      clickedRowIndex === index && isCheckingForDataAvailability && 'opacity-50'
                    }`}
                    key={index}>
                    <td scope='row' className='w-[61px] py-[10px] px-[21px]'>
                      <input
                        type='checkbox'
                        checked={selectedCollocateDevices.includes(device.device_name)}
                        value={device}
                        onChange={(e) => handleSelectDevice(e, device)}
                      />
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3 uppercase'>
                      {device.device_name}
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
                      {device.added_by || ' '}
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
                      {moment(device.start_date).format('MMM DD, YYYY')}
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
                      {moment(device.end_date).format('MMM DD, YYYY')}
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
                      <span
                        className={`${
                          STATUS_COLOR_CODES[device.status.toLowerCase()]
                        } rounded-[10px] px-2 py-[2px] capitalize text-black-600`}>
                        {device.status.toLowerCase()}
                      </span>
                    </td>
                    <td scope='row' className='w-[75px] px-4 py-3'>
                      <Dropdown
                        menu={menu}
                        length={index === collocationDevices.length - 1 ? 'last' : ''}
                        onItemClick={(id) => handleItemClick(id, device, index)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan='6' className='text-center pt-6 text-grey-300'>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>

      {/* modal */}
      <Modal
        display={visible}
        action={deleteBatch}
        closeModal={() => setVisible(false)}
        description='Are you sure you want to delete this batch?'
        confirmButton='Delete'
      />
    </div>
  );
};

export default DataTable;
