import React, { useState } from 'react';
import Close from '@/icons/Actions/close.svg';
import Button from '@/components/Button';

const Modal = ({ description, confirmButton, handleConfirm, display, closeModal }) => {
  const [loading, setLoading] = useState(false);
  console.log(loading);
  const handleClick = async () => {
    setLoading(true);
    try {
      await handleConfirm();
    } catch (error) {
      throw error;
    }

    setLoading(false);
  };

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
            className='absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center justify-center dark:hover:bg-gray-800 dark:hover:text-white'
          >
            <Close className='w-5 h-5' />
            <span className='sr-only'>Close Modal</span>
          </button>
          <div className='p-6 text-center flex flex-col justify-center items-center'>
            <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
              {description}
            </h3>
            <div className='flex space-x-3'>
              {confirmButton && (
                <Button
                  className='text-sm font-medium capitalize'
                  variant={loading ? 'disabled' : 'filled'}
                  disabled={loading}
                  onClick={handleClick}
                >
                  {loading ? 'Loading...' : 'Delete'}
                </Button>
              )}

              <Button
                className='text-sm font-medium capitalize'
                variant='outlined'
                disabled={loading}
                onClick={closeModal}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
