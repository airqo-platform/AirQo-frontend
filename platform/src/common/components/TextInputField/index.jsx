import React from 'react';

const TextInputField = ({ id, value, onChange, label, type }) => {
  return (
    <div className='relative flex flex-col gap-[6px]'>
      <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>{label}</label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
        required
      />
    </div>
  );
};

export default TextInputField;
