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
import { useGetCollocationResultsQuery } from '@/lib/store/services/collocation';
import Toast from '@/components/Toast';

const STATUS_COLOR_CODES = {
  passed: 'bg-green-200',
  failed: 'bg-red-200',
  running: 'bg-turquoise-200',
  scheduled: 'bg-yellow-200',
};

const DataTable = ({ filteredData, collocationDevices, isLoading }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [collocationInput, setCollocationInput] = useState({
    devices: null,
    startDate: null,
    endDate: null,
  });

  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );
  const { data: data, error } = useGetCollocationResultsQuery(collocationInput);

  let collocationResults = data ? data.data : [];
  const [isCollocationResultsError, setCollocationResultsError] = useState(false);

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

  const openMonitorReport = (deviceName, startDate, endDate) => {
    setCollocationInput({
      devices: [deviceName],
      startDate,
      endDate,
    });

    if (collocationResults && Object.keys(error).includes('data')) {
      setCollocationResultsError(true);
      setTimeout(() => {
        setCollocationResultsError(false);
      }, 5000);
    } else {
      router.push('/collocate/reports/monitor_report');
    }
  };

  return (
    <div>
      {isCollocationResultsError && (
        <Toast variant={'error'} message='Error: Unable to fetch devices' />
      )}
      <table className='border-collapse text-xs text-left w-full mb-6'>
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
                  <tr className='border-b border-b-slate-300' key={device.index}>
                    <td scope='row' className='w-[61px] py-[10px] px-[21px]'>
                      <input
                        type='checkbox'
                        checked={selectedCollocateDevices.includes(device.device_name)}
                        value={device}
                        onChange={(e) => handleSelectDevice(e, device)}
                      />
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
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
                          STATUS_COLOR_CODES[device.status]
                        } rounded-[10px] px-2 py-[2px] capitalize text-black-600`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td scope='row' className='w-[75px] px-4 py-3'>
                      <span
                        onClick={() =>
                          openMonitorReport(device.device_name, device.start_date, device.end_date)
                        }
                        className='w-10 h-10 p-2 rounded-lg border border-grey-200 flex justify-center items-center'
                      >
                        <MoreHorizIcon />
                      </span>
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
    </div>
  );
};

export default DataTable;
