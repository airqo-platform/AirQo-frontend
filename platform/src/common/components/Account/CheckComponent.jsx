import React from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@/icons/tickIcon';

const CheckComponent = ({
  text,
  width,
  bgColor,
  padding,
  border,
  subText,
  titleFont,
  checked,
  onChangeFunc,
}) => {
  return (
    <div
      className={`${bgColor || 'bg-white'} ${padding || 'p-7'} ${
        width || 'lg:w-fit w-11/12'
      } border ${border || 'border-radio-border'} rounded-lg ${checked && 'ring-1 ring-blue-600'}`}>
      <div className='flex flex-col justify-start'>
        {checked ? (
          <div className='w-8 h-8 mb-3 flex justify-center items-center rounded-full bg-blue-900'>
            <CheckIcon fill='#FFFFFF' />
          </div>
        ) : (
          <div className='text-base border w-8 h-8 mb-3 flex justify-center items-center font-medium rounded-full'></div>
        )}
        <div className={`${titleFont || 'text-xl font-semibold'}`}>{text}</div>
      </div>
      {subText && <div className='mt-2 text-sm'>{subText}</div>}
    </div>
  );
};

CheckComponent.propTypes = {
  text: PropTypes.string,
  width: PropTypes.string,
  bgColor: PropTypes.string,
  border: PropTypes.string,
  subText: PropTypes.string,
  titleFont: PropTypes.string,
  checked: PropTypes.bool,
  onChangeFunc: PropTypes.func,
};

export default CheckComponent;
