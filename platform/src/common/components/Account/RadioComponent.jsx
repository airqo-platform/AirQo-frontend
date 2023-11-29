import React from 'react';
import PropTypes from 'prop-types';

const RadioComponent = ({
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
      } border ${border || 'border-radio-border'} cursor-pointer rounded-lg ${
        checked && 'ring-2 ring-blue-600'
      }`}>
      <div className='flex flex-row items-center'>
        <div className='flex items-center'>
          <input
            type='radio'
            name={text}
            className='border rounded-2xl border-radio-border h-5 w-5 bg-white checked:bg-blue-900'
            checked={checked || false}
            onChange={onChangeFunc}
          />
        </div>
        <div className={`ml-3 ${titleFont || 'text-xl font-semibold'}`}>{text}</div>
      </div>
      {subText && <div className='mt-2 text-sm'>{subText}</div>}
    </div>
  );
};

RadioComponent.propTypes = {
  text: PropTypes.string,
  width: PropTypes.string,
  bgColor: PropTypes.string,
  border: PropTypes.string,
  subText: PropTypes.string,
  titleFont: PropTypes.string,
  checked: PropTypes.bool,
  onChangeFunc: PropTypes.func,
};

export default RadioComponent;
