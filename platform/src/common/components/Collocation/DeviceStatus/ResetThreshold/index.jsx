import Button from '@/components/Button';
import { useState } from 'react';

const ResetThreshold = ({ closeForm }) => {
  const [thresholdValue, setThresholdValue] = useState('');

  const submitForm = (e) => {
    e.preventDefault();
    console.log(thresholdValue);
    closeForm();
  };

  return (
    <div className='w-full mt-4'>
      <div className='flex gap-2 flex-wrap'>
        <input
          type='text'
          placeholder='Type here'
          className='input input-bordered input-sm w-full max-w-xs rounded-none outline-none border-none'
          onChange={(e) => setThresholdValue(e.target.value)}
        />
        <Button
          type='submit'
          onClick={submitForm}
          className='text-white w-[178px] h-8 text-sm bg-blue-900'
        >
          Reset threshold
        </Button>
      </div>
    </div>
  );
};

export default ResetThreshold;
