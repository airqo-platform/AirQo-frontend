import React from 'react';

const TextInputField = ({ id, value, onChange, label, type, Icon }) => {
  return (
    <div className='relative flex flex-col gap-[6px]'>
      <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>{label}</label>
      <div className='flex items-center'>
        {Icon && (
          <span className='absolute left-0 top-3 w-10 h-full flex items-center justify-center'>
            <Icon />
          </span>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className={`bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white ${
            Icon ? 'pl-10' : 'pl-3'
          }`}
          required
        />
      </div>
    </div>
  );
};

export default TextInputField;
