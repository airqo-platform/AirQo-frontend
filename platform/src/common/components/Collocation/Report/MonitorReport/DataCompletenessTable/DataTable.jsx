import { useDispatch, useSelector } from 'react-redux';
import {
  addDevices,
  removeDevices,
  addDevice,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
import moment from 'moment';
import Spinner from '@/components/Spinner';

const DataTable = ({ filteredData, dataCompletenessResults, isLoading }) => {
  const dispatch = useDispatch();
  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  const handleSelectAllDevices = (e) => {
    const allDevices = [];
    dataCompletenessResults &&
      dataCompletenessResults.map((device) => allDevices.push(device.device_name));
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

  return (
    <table className='border-collapse text-sm text-left w-full mb-6'>
      <thead>
        <tr className='border-b border-b-slate-300 text-black'>
          <th scope='col' className='text-xs font-normal w-[61px] pb-3 px-6'>
            <input
              type='checkbox'
              checked={
                dataCompletenessResults &&
                selectedCollocateDevices.length === dataCompletenessResults.length
              }
              onChange={handleSelectAllDevices}
            />
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[129.52px] px-4 pb-3 opacity-40'
          >
            Monitor name
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[129.52px] px-4 pb-3 opacity-40'
          >
            Expected records
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[128.57px] px-4 pb-3 opacity-40'
          >
            Completeness
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[128.57px] px-4 pb-3 opacity-40'
          >
            Missing
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[128.57px] px-4 pb-3 opacity-40'
          >
            Actual records
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[126.67px] px-4 pb-3 opacity-40'
          >
            Started
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black-900 w-[128.57px] px-4 pb-3 opacity-40'
          >
            Ended
          </th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan='8' scope='row' className='pt-6 text-center'>
              <Spinner />
            </td>
          </tr>
        ) : (
          <>
            {filteredData &&
              filteredData.map((device, index) => {
                return (
                  <tr className='border-b border-b-slate-300 text-xs' key={index}>
                    <td scope='row' className='w-[61px] py-3 px-6'>
                      <input
                        type='checkbox'
                        checked={selectedCollocateDevices.includes(device.device_name)}
                        value={device}
                        onChange={(e) => handleSelectDevice(e, device)}
                      />
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {device.device_name}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {device.expected_number_of_records}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {device.completeness.toFixed(2) + '%'}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {device.missing.toFixed(2) + '%'}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {device.actual_number_of_records}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {moment(device.start_date).format('MMM DD, YYYY')}
                    </td>
                    <td scope='row' className='w-[145px] px-4 py-3'>
                      {moment(device.end_date).format('MMM DD, YYYY')}
                    </td>
                  </tr>
                );
              })}
          </>
        )}
      </tbody>
    </table>
  );
};

export default DataTable;
