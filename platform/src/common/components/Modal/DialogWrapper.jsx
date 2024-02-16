import Button from '@/components/Button';

export const DialogWrapper = ({
  children,
  ModalIcon,
  handleClick,
  open,
  onClose,
  primaryButtonText = 'Submit',
  loading = false,
}) => {
  const handleCancel = () => {
    onClose();
  };

  return (
    <dialog
      id='modal_dialog'
      className={`${open ? 'visible modal modal-open' : 'hidden'} w-screen h-screen`}
    >
      <div className='modal-box p-0 w-[400px] h-auto pt-6 bg-white rounded-lg shadow border border-gray-50 flex-col justify-start items-center gap-6 flex'>
        <div className='self-stretch px-6 flex-col justify-start items-start gap-5 flex'>
          <div className='self-stretch flex-col justify-start items-start gap-2 flex'>
            <div
              className={`flex w-full ${
                ModalIcon ? 'justify-between' : 'justify-end'
              } items-center`}
            >
              {ModalIcon && (
                <div className='p-5 bg-indigo-50 rounded-full border-indigo-50 justify-start items-start gap-1 flex'>
                  <ModalIcon className='w-6 h-6' />
                </div>
              )}
            </div>
            <div className='self-stretch'>{children}</div>
          </div>
        </div>
        <div className='self-stretch p-5 bg-gray-50 border-gray-200 justify-end items-start gap-3 inline-flex w-full'>
          <Button onClick={handleCancel} variant='outlined' className='text-sm font-medium'>
            Cancel
          </Button>
          <Button
            variant={loading ? 'disabled' : 'filled'}
            className='text-sm font-medium'
            onClick={handleClick}
          >
            {loading ? 'Loading...' : primaryButtonText}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
export default DialogWrapper;
