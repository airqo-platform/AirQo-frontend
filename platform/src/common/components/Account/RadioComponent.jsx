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
  return (
    <div
      className={`${bgColor ? bgColor : 'bg-white'} ${padding ? padding : 'p-7'} ${
        width ? width : 'lg:w-fit w-11/12'
      } border ${border ? border : 'border-radio-border'} rounded-lg focus-within:border-blue-900`}>
      <div className='flex flex-row items-center'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            name={text}
            className='border rounded-2xl border-radio-border h-5 w-5 bg-white checked:bg-blue-900'
            defaultChecked={checked ? checked : false}
          />
        </div>
        <div className={`ml-3 ${titleFont ? titleFont : 'text-xl font-semibold'}`}>{text}</div>
      </div>
      {subText ? <div className='mt-2 text-sm'>{subText}</div> : <></>}
    </div>
  );
};

export default RadioComponent;
