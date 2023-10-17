import React from 'react';

const RadioComponent = ({ text, width, bgColor, padding, border, subText }) => {
  return (
    <div
      className={`${bgColor ? bgColor : 'bg-white'} ${padding ? padding : 'p-7'} ${
        width ? width : 'lg:w-fit w-11/12'
      } border ${border ? border : 'border-radio-border'} rounded-lg`}>
      <div className='flex flex-row items-center'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            name={text}
            className='border rounded-2xl default:border-radio-border h-5 w-5 default:bg-white checked:bg-blue-900 active:border-blue-900'
          />
        </div>
        <div className='ml-3 text-xl font-semibold'>{text}</div>
      </div>
      <div className='mt-2 text-sm'>{subText}</div>
    </div>
  );
};

export default RadioComponent;
