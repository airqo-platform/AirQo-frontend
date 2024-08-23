'use client';
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Transition, TransitionChild } from '@headlessui/react';
import TabButtons from '../../Button/TabButtons';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Close from '@/icons/close_icon';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import Button from '../../Button';
import WorldIcon from '@/icons/SideBar/world_Icon';
import CustomDropdown from '../../Dropdowns/CustomDropdown';
import CalibrateIcon from '@/icons/Analytics/calibrateIcon';
import FileTypeIcon from '@/icons/Analytics/fileTypeIcon';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import WindIcon from '@/icons/Analytics/windIcon';
import DataTable from './DataTable';
import EditIcon from '@/icons/Analytics/EditIcon';
import DatePicker from '../../Calendar/DatePicker';
import CheckIcon from '@/icons/tickIcon';
import { toast } from 'sonner';

// Define options as constants outside the component

const POLLUTANT_OPTIONS = [
  { id: 1, name: 'PM2.5' },
  { id: 2, name: 'PM10' },
  { id: 3, name: 'CO' },
  { id: 4, name: 'SO2' },
  { id: 5, name: 'NO2' },
];

const DATA_TYPE_OPTIONS = [
  { id: 1, name: 'Calibrated Data' },
  { id: 2, name: 'Raw Data' },
];

const FREQUENCY_OPTIONS = [
  { id: 1, name: 'Daily' },
  { id: 2, name: 'Hourly' },
  { id: 3, name: 'Weekly' },
  { id: 4, name: 'Monthly' },
];

const FILE_TYPE_OPTIONS = [
  { id: 1, name: 'CSV' },
  { id: 2, name: 'Json' },
  { id: 3, name: 'PDF' },
];

const tableData = [
  {
    id: 1,
    location: 'Makerere University ',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'AirQo',
  },
  {
    id: 2,
    location: 'KCCA',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'KCCA',
  },
  {
    id: 3,
    location: 'Ntinda',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'AirQo',
  },
  {
    id: 4,
    location: 'Makindye',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'AirQo',
  },
  {
    id: 5,
    location: 'Nakawa',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'KCCA',
  },
  {
    id: 6,
    location: 'Kansanga',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'AirQo',
  },
  {
    id: 5,
    location: 'Nakawa',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'KCCA',
  },
  {
    id: 6,
    location: 'Kansanga',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'AirQo',
  },
  {
    id: 5,
    location: 'Nakawa',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'KCCA',
  },
  {
    id: 6,
    location: 'Kansanga',
    city: 'Kampala',
    country: 'Uganda',
    owner: 'AirQo',
  },
];

const CustomFields = React.memo(
  ({
    field = false,
    title,
    options = [],
    id,
    icon,
    btnText,
    edit = false,
    useCalendar = false,
    handleOptionSelect,
    defaultOption,
  }) => {
    const [selectedOption, setSelectedOption] = useState(
      defaultOption || options[0],
    );

    const handleSelect = useCallback(
      (option) => {
        setSelectedOption(option);
        handleOptionSelect(id, option);
      },
      [id, handleOptionSelect],
    );

    return (
      <div className="w-full h-auto flex flex-col gap-2 justify-start">
        <label className="w-[280px] h-auto p-0 m-0 text-[#7A7F87]">
          {title}
        </label>
        {field ? (
          <input
            className="bg-transparent text-[16px] font-medium leading-6 p-0 m-0 w-full h-auto border-none"
            defaultValue={'Untitled Report'}
            value={selectedOption.name}
            onChange={(e) => handleSelect({ name: e.target.value })}
            type="text"
            name={id}
            disabled={!edit}
          />
        ) : useCalendar ? (
          <DatePicker
            customPopperStyle={{ left: '-7px' }}
            onChange={(date) => handleSelect({ name: date })}
          />
        ) : (
          <CustomDropdown
            tabID={id}
            tabStyle="w-full bg-white px-3 py-2"
            dropdown
            tabIcon={icon}
            btnText={btnText || selectedOption.name}
            customPopperStyle={{ left: '-7px' }}
            dropDownClass="w-full"
          >
            {options.map((option) => (
              <span
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center  ${
                  selectedOption.id === option.id
                    ? 'bg-[#EBF5FF] rounded-md'
                    : ''
                }`}
              >
                <span className="flex items-center capitalize space-x-2">
                  <span>{option.name}</span>
                </span>
                {selectedOption.id === option.id && (
                  <CheckIcon fill={'#145FFF'} />
                )}
              </span>
            ))}
          </CustomDropdown>
        )}
      </div>
    );
  },
);

const Modal = React.memo(({ isOpen, onClose }) => {
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const userInfo = useSelector((state) => state.login.userInfo);
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);

  const NETWORK_OPTIONS = userInfo?.groups?.map((network) => ({
    id: network._id,
    name: network.grp_title,
  }));

  const [formData, setFormData] = useState({
    title: 'Untitled Report',
    network: NETWORK_OPTIONS[0],
    dataType: DATA_TYPE_OPTIONS[0],
    pollutant: POLLUTANT_OPTIONS[0],
    duration: null,
    frequency: FREQUENCY_OPTIONS[0],
    fileType: FILE_TYPE_OPTIONS[0],
  });
  const [edit, setEdit] = useState(false);

  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  const handleOptionSelect = useCallback((id, option) => {
    setFormData((prevData) => ({ ...prevData, [id]: option }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.duration) {
        toast.error('Please select a duration', {
          position: 'top-center',
        });
        return;
      }
      if (selectedSites.length === 0) {
        toast.error('Please select at least one location', {
          position: 'top-center',
        });
        return;
      }
      // Prepare data for API
      const apiData = {
        ...formData,
        selectedSites,
      };
      console.log('Submitting data to API:', apiData);
      // reset form data
      setFormData({
        title: 'Untitled Report',
        network: NETWORK_OPTIONS[0],
        dataType: DATA_TYPE_OPTIONS[0],
        pollutant: POLLUTANT_OPTIONS[0],
        duration: null,
        frequency: FREQUENCY_OPTIONS[0],
        fileType: FILE_TYPE_OPTIONS[0],
      });
    },
    [formData, selectedSites],
  );

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
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle lg:min-w-[1020px] h-auto ">
            {/* header */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-[#E2E3E5]">
              <h3
                className="flex text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
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
              {/* section 1 */}
              <form
                className="w-[280px] relative h-auto bg-[#f6f6f7] space-y-3 px-5 pt-5 pb-14"
                onSubmit={handleSubmit}
              >
                <button
                  type="button"
                  className={`absolute top-8 right-6 ${edit ? 'text-blue-600' : ''}`}
                  onClick={() => setEdit(!edit)}
                >
                  {edit ? 'Done' : <EditIcon />}
                </button>
                <CustomFields
                  field
                  title="Title"
                  edit={edit}
                  id="title"
                  defaultOption={{ name: formData.title }}
                  handleOptionSelect={handleOptionSelect}
                />
                <CustomFields
                  title="Network"
                  options={NETWORK_OPTIONS}
                  id="network"
                  icon={<WorldIcon width={16} height={16} fill="#000" />}
                  defaultOption={formData.network}
                  handleOptionSelect={handleOptionSelect}
                />
                <CustomFields
                  title="Data type"
                  options={DATA_TYPE_OPTIONS}
                  id="dataType"
                  icon={<CalibrateIcon />}
                  defaultOption={formData.dataType}
                  handleOptionSelect={handleOptionSelect}
                />
                <CustomFields
                  title="Pollutant"
                  options={POLLUTANT_OPTIONS}
                  id="pollutant"
                  icon={<WindIcon />}
                  defaultOption={formData.pollutant}
                  handleOptionSelect={handleOptionSelect}
                />
                <CustomFields
                  title="Duration"
                  id="duration"
                  useCalendar={true}
                  defaultOption={formData.duration}
                  handleOptionSelect={handleOptionSelect}
                />
                <CustomFields
                  title="Frequency"
                  options={FREQUENCY_OPTIONS}
                  id="frequency"
                  icon={<FrequencyIcon />}
                  defaultOption={formData.frequency}
                  handleOptionSelect={handleOptionSelect}
                />
                <CustomFields
                  title="File type"
                  options={FILE_TYPE_OPTIONS}
                  id="fileType"
                  icon={<FileTypeIcon />}
                  defaultOption={formData.fileType}
                  handleOptionSelect={handleOptionSelect}
                />
              </form>
              {/* section 2 */}
              <div className="bg-white relative w-full h-auto">
                <div className="px-8 pt-6 pb-4 overflow-y-auto">
                  <DataTable
                    data={tableData}
                    setSelectedSites={setSelectedSites}
                    clearSelectedSites={clearSelected}
                  />
                </div>
                <div className="bg-gray-50 absolute bottom-0 right-0 w-full px-4 py-3 sm:px-6 flex items-center justify-between">
                  <div className="text-sm leading-5 font-normal">
                    {selectedSites.length === 0 ? (
                      'Select locations to continue'
                    ) : (
                      <div>
                        <span className="text-blue-600">{`${selectedSites.length} 
                          ${selectedSites.length === 1 ? 'location' : 'locations'} selected
                        `}</span>
                        <button
                          type="button"
                          className="ml-2"
                          onClick={handleClearSelection}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="sm:flex sm:flex-row-reverse gap-2">
                    <Button
                      type="button"
                      variant={'filled'}
                      onClick={handleSubmit}
                    >
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant={'outlined'}
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
    </Transition>
  );
});

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TabButtons
        btnText="Download Data"
        Icon={<DownloadIcon width={16} height={17} color="white" />}
        onClick={() => setIsOpen(true)}
        btnStyle={
          'bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl'
        }
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Index;
