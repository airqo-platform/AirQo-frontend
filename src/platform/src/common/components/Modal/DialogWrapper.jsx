import React, { useEffect, useRef } from 'react';
import Button from '@/common/components/Button';
import Card from '@/common/components/CardWrapper';

export const DialogWrapper = ({
  children,
  ModalIcon,
  handleClick,
  open,
  onClose,
  primaryButtonText = 'Submit',
  loading = false,
  width = 'w-full max-w-[400px]',
  footer,
}) => {
  const dialogRef = useRef(null);

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <dialog
      id="modal_dialog"
      className={`${
        open ? 'visible modal modal-open' : 'hidden'
      } w-screen h-screen flex items-center justify-center`}
    >
      <div className="fixed inset-0" onClick={onClose} />
      <Card
        ref={dialogRef}
        width={width}
        height="h-auto"
        className="mx-auto p-2"
        contentClassName="overflow-hidden"
        header={
          ModalIcon && (
            <div className="flex justify-between items-center w-full">
              <div className="p-5 bg-indigo-50 rounded-full border border-indigo-50 flex justify-center items-center">
                <ModalIcon className="w-6 h-6" />
              </div>
            </div>
          )
        }
        footer={
          footer !== undefined ? (
            footer
          ) : (
            <div className="flex justify-end items-center gap-3 w-full">
              <Button
                onClick={handleCancel}
                variant="outlined"
                className="text-sm font-medium dark:bg-transparent"
              >
                Cancel
              </Button>
              <Button
                variant={loading ? 'disabled' : 'filled'}
                className="text-sm font-medium"
                onClick={handleClick}
              >
                {loading ? 'Loading...' : primaryButtonText}
              </Button>
            </div>
          )
        }
        headerProps={{ className: 'pb-4' }}
        footerProps={{ className: 'pt-4' }}
      >
        <div className="w-full">{children}</div>
      </Card>
    </dialog>
  );
};

export default DialogWrapper;
