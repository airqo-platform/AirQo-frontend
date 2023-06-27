import React from 'react';

import Close from '@/icons/Actions/close.svg';
import Exclamation from '@/icons/Actions/exclamation.svg';

const Modal = ({ description, confirmButton, handleConfirm, display, closeModal }) => {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
      }}
      className={`fixed inset-0 p-4 z-50 overflow-x-hidden overflow-y-auto flex items-center justify-center ${
        display ? '' : 'hidden'
      }`}
    >
      <div className='relative w-full max-w-md max-h-full'>
        <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
          <button
            onClick={closeModal}
            type='button'
            className='absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white'
          >
            <Close className='w-5 h-5' />
            <span className='sr-only'>Close Modal</span>
          </button>
          <div className='p-6 text-center'>
            <Exclamation className='w-16 h-16 mx-auto mb-2' fill='#F87171' />
            <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
              {description}
            </h3>
            {confirmButton && (
              <button
                onClick={handleConfirm}
                type='button'
                className='text-white bg-red-600 hover:bg-red-800 focus:ring-red-300 focus:ring-opacity-50 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 cursor-pointer transform transition hover:scale-[1.05]'
              >
                {confirmButton}
              </button>
            )}
            <button
              onClick={closeModal}
              type='button'
              className='text-gray-500 bg-white hover:bg-gray-100 focus:ring-gray-200 focus:ring-opacity-50 focus:outline-none rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 cursor-pointer transform transition hover:scale-[1.05]'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
