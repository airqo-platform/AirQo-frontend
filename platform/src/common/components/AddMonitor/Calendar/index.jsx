import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addEndDate,
  addStartDate,
} from '@/lib/store/services/addMonitor/selectedCollocateDevicesSlice';
import Datepicker from 'react-tailwindcss-datepicker';

const ScheduleCalendar = () => {
  const collationDurations = [4, 7, 14];
  const dispatch = useDispatch();
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });

  const handleValueChange = (newValue) => {
    setValue(newValue);
    dispatch(addStartDate(newValue.startDate));
    dispatch(addEndDate(newValue.endDate));
  };

  return (
    <div className='pt-6'>
      <div className='px-6 pb-7'>
        <h3 className='text-xl'>Choose collocation period</h3>
        <h5 className='text-grey-300 text-sm mb-4'>Select your collocation period</h5>
        {collationDurations.map((duration, index) => (
          <div
            className='border border-grey-100 py-1 px-4 rounded-md my-2 flex flex-row justify-between items-center'
            key={index}
          >
            {duration} {'days'}
            <input type='radio' name='duration' disabled />
          </div>
        ))}
        <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center'>
          Custom
          <input type='radio' name='duration' disabled />
        </div>
      </div>
      <div className='border-none border-r-0 border-l-0 border-b-0 border-t-skeleton'>
        <div className='mb-8 flex flex-row justify-between items-center px-6'>
          {/* TODO: Duration upon range selection */}
          <Datepicker
            classNames={'prose'}
            value={value}
            onChange={handleValueChange}
            showShortcuts={true}
            primaryColor={'#F5F8FF'}
            placeholder={'YYYY-MM-DD to YYYY-MM-DD'}
            separator={'to'}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
