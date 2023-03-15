import { humanReadableDate } from '@/core/utils/dateTime';
import { useDispatch, useSelector } from 'react-redux';
import {
  addDevices,
  removeDevices,
  addDevice,
} from '@/lib/store/services/addMonitor/selectedCollocateDevicesSlice';

const DataTable = ({ paginatedData, collocationDevices }) => {
  const dispatch = useDispatch();
  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  const handleSelectAllDevices = (e) => {
    const allDevices = [];
    collocationDevices.map((device) => allDevices.push(device._id));
    if (e.target.checked) {
      dispatch(addDevices(allDevices));
    } else {
      dispatch(removeDevices(allDevices));
    }
  };

  const handleSelectDevice = (e, device) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      dispatch(addDevices([device._id]));
    } else {
      dispatch(removeDevices([device._id]));
    }
  };

  return (
    <table className='border-collapse text-sm text-left w-full mb-6'>
      <thead>
        <tr className='border-b border-b-slate-300 text-black'>
          <th scope='col' className='text-xs font-normal w-[61px] pb-3 px-6'>
            <input
              type='checkbox'
              checked={selectedCollocateDevices.length === collocationDevices.length}
              onChange={handleSelectAllDevices}
            />
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[129.52px] px-4 pb-3 opacity-40'
          >
            Monitor name
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[129.52px] px-4 pb-3 opacity-40'
          >
            Expected records
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[128.57px] px-4 pb-3 opacity-40'
          >
            Completeness
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[128.57px] px-4 pb-3 opacity-40'
          >
            Missing
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[128.57px] px-4 pb-3 opacity-40'
          >
            Hourly count
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[126.67px] px-4 pb-3 opacity-40'
          >
            Started
          </th>
          <th
            scope='col'
            className='text-xs font-normal text-black w-[128.57px] px-4 pb-3 opacity-40'
          >
            Ended
          </th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.length > 0 &&
          paginatedData.map((device) => {
            return (
              <tr className='border-b border-b-slate-300' key={device._id}>
                <td scope='row' className='w-[61px] py-3 px-6'>
                  <input
                    type='checkbox'
                    checked={selectedCollocateDevices.includes(device._id)}
                    value={device}
                    onChange={(e) => handleSelectDevice(e, device)}
                  />
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.monitor_name}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.expected_records}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.data_completeness}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.missing_data}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.total_hourly_count}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {humanReadableDate(device.start_date)}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {humanReadableDate(device.end_date)}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default DataTable;
