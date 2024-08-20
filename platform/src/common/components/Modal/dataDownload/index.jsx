import React, { useState, useRef } from 'react';
import { Transition, TransitionChild } from '@headlessui/react';
import TabButtons from '../../Button/TabButtons';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Close from '@/icons/close_icon';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import Button from '../../Button';

const Modal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div className="fixed inset-0 z-50  min-h-screen flex items-center justify-center overflow-y-auto">
        <div className="flex items-center justify-center px-4 text-center sm:block sm:p-0">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
          </TransitionChild>

          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              ref={modalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle lg:min-w-[1020px]"
            >
              <div className="flex items-center justify-between py-4 px-5 border-b border-[#E2E3E5]">
                <h3 className="flex text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  <button type="button" onClick={null}>
                    <LongArrowLeft className="mr-2" />
                  </button>
                  Download air quality data
                </h3>
                <div>
                  <button type="button" onClick={onClose}>
                    <Close fill="#000" />
                    <span className="sr-only">Close Modal</span>
                  </button>
                </div>
              </div>
              <div className="w-full h-auto flex">
                <div className="w-[280px] h-auto bg-[#E2E3E5] px-5 py-6">new data</div>
                <div className="bg-white w-full h-auto">
                  <div className="sm:flex sm:items-start px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    NEW DATA
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between">
                    <div className="text-sm leading-5 font-normal">
                      Select locations to continue
                    </div>
                    <div className="sm:flex sm:flex-row-reverse">
                      <Button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                      >
                        Download
                      </Button>
                      <Button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Transition>
  );
};

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TabButtons
        btnText="Download Data"
        Icon={<DownloadIcon width={16} height={17} color="white" />}
        onClick={() => setIsOpen(true)}
        btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl"
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Index;
