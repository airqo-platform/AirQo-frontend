'use client';
import React, { useState, useRef } from 'react';
import { Transition, TransitionChild } from '@headlessui/react';
import TabButtons from '../../Button/TabButtons';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Close from '@/icons/close_icon';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import Button from '../../Button';
import WorldIcon from '@/icons/SideBar/world_Icon';
import CustomDropdown from '../../Dropdowns/CustomDropdown';
import TopBarSearch from '../../search/TopBarSearch';
import CalibrateIcon from '@/icons/Analytics/calibrateIcon';
import FileTypeIcon from '@/icons/Analytics/fileTypeIcon';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import WindIcon from '@/icons/Analytics/windIcon';

const Network = [
  { id: 1, name: 'AirQo' },
  { id: 2, name: 'KCCA' },
];

const CustomFields = ({ field = false, title, options, id, icon, btnText }) => {
  return (
    <div className="w-full h-auto flex flex-col gap-2 justify-start">
      <label className="w-[280px] h-auto p-0 m-0 text-[#7A7F87]">{title}</label>
      {field ? (
        <input
          className="bg-transparent text-[16px] font-medium leading-6 p-0 m-0 w-full h-auto border-none"
          value={'Untitled Report'}
          color="black"
          type="text"
          name="title"
        />
      ) : (
        <CustomDropdown
          tabID={id}
          tabStyle="w-full bg-white px-3 py-2"
          dropdown
          tabIcon={icon}
          btnText={btnText}
          customPopperStyle={{ left: '-10px' }}
          dropDownClass="w-full"
        >
          {options.map((option) => (
            <span
              key={option.id}
              onClick={() => {
                null;
              }}
              className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center 
                
                `}
            >
              <span className="flex items-center space-x-2">
                <span>{option.name}</span>
              </span>
              {/* {chartData.pollutionType === option.id && <CheckIcon fill={'#145FFF'} />} */}
            </span>
          ))}
        </CustomDropdown>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div className="fixed inset-0 z-50  min-h-screen flex items-center justify-center overflow-y-auto">
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
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle lg:min-w-[1020px] h-auto lg:max-h-[658px]"
          >
            {/* header */}
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
            {/* body */}
            <div className="flex flex-grow">
              <div className="w-[280px] h-auto bg-[#f6f6f7] space-y-3 px-5 py-6">
                <CustomFields field title="Title" />
                <CustomFields
                  title="Network"
                  options={Network}
                  id={'network'}
                  btnText="AirQo"
                  icon={<WorldIcon fill="#000" />}
                />
                <CustomFields
                  title="Data type"
                  options={Network}
                  id={'dataType'}
                  icon={<CalibrateIcon />}
                />
                <CustomFields
                  title="Pollutant"
                  options={Network}
                  id={'pollutant'}
                  icon={<WindIcon />}
                />
                <CustomFields
                  title="Frequency"
                  options={Network}
                  id={'frequency'}
                  icon={<FrequencyIcon />}
                />
                <CustomFields
                  title="File type"
                  options={Network}
                  id={'fileType'}
                  icon={<FileTypeIcon />}
                />
              </div>
              <div className="bg-white relative w-full h-auto">
                <div className="flex justify-between h-auto items-center px-8 pt-6 pb-4">
                  <div className="gap-2 flex items-center">
                    <Button type="button" onClick={null} variant="filled">
                      All
                    </Button>
                    <Button type="button" onClick={null} variant="outlined">
                      Favorites
                    </Button>
                  </div>
                  <TopBarSearch />
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between">
                  <div className="text-sm leading-5 font-normal">Select locations to continue</div>
                  <div className="sm:flex sm:flex-row-reverse gap-2">
                    <Button type="button" variant={'filled'} onClick={onClose}>
                      Download
                    </Button>
                    <Button type="button" variant={'outlined'} onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionChild>
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
