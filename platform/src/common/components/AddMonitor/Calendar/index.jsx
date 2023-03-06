import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addEndDate,
  addStartDate,
} from '@/lib/store/services/addMonitor/selectedCollocateDevicesSlice';
import Datepicker from 'react-tailwindcss-datepicker';
import moment from 'moment';

const ScheduleCalendar = () => {
  const collationDurations = [4, 7, 14];
  const [duration, setDuration] = useState(null);
  const [customRange, setCustomRange] = useState(false);

  const dispatch = useDispatch();

  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue) => {
    setValue(newValue);
    dispatch(addStartDate(newValue.startDate));
    dispatch(addEndDate(newValue.endDate));
  };

  const handleDurationChange = (event) => {
    let startDate, endDate;
    setDuration(Number(event.target.value));
    setCustomRange(false);
    const today = moment();
    startDate = today.format('YYYY-MM-DD');
    endDate = today.add(event.target.value - 1, 'days').format('YYYY-MM-DD');
    dispatch(addStartDate(startDate));
    dispatch(addEndDate(endDate));
    setValue({
      startDate: startDate,
      endDate: endDate,
    });
  };

  const handleCustomRangeChange = (event) => {
    setCustomRange(event.target.checked);
  };

  return (
    <div className='pt-6'>
      <div className='px-6 pb-7'>
        <h3 className='text-xl'>Choose collocation period</h3>
        <h5 className='text-grey-300 text-sm mb-4'>Select your collocation period</h5>
        {collationDurations.map((option, index) => (
          <div
            className='border border-grey-100 py-1 px-4 rounded-md my-2 flex flex-row justify-between items-center'
            key={index}
          >
            {option} {'days'}
            <input
              type='radio'
              name='duration'
              value={option}
              checked={duration === option && !customRange}
              onChange={handleDurationChange}
            />
          </div>
        ))}
        <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center'>
          Custom
          <input
            type='radio'
            name='duration'
            value='custom'
            checked={customRange}
            onChange={handleCustomRangeChange}
          />
        </div>
      </div>
      {customRange && (
        <div className='border-none border-r-0 border-l-0 border-b-0 border-t-skeleton'>
          <div className='mb-8 flex flex-row justify-between items-center px-6'>
            {/* TODO: Duration upon range selection */}
            <Datepicker
              value={value}
              onChange={handleValueChange}
              primaryColor={'#F5F8FF'}
              placeholder={'YYYY-MM-DD to YYYY-MM-DD'}
              separator={'to'}
              readOnly={true}
              inputClassName='font-sans text-xs text-grey-300 font-normal'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
