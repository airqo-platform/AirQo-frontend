import React from 'react'

const RadioComponent = ({text}) => {
  return (
    <div className='bg-form-input p-4 lg:w-fit w-11/12'>
      <div className='flex flex-row items-center'>
        <div className='flex items-center'>
          <input type='radio' name={text} className='border-radio-input bg-form-input checked:bg-blue-900' />
        </div>
        <div className='ml-2'>{text}</div>
      </div>
    </div>
  );
}

export default RadioComponent