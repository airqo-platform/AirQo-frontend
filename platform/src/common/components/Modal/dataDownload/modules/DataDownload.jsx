import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import WorldIcon from '@/icons/SideBar/world_Icon';
import CalibrateIcon from '@/icons/Analytics/calibrateIcon';
import FileTypeIcon from '@/icons/Analytics/fileTypeIcon';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import WindIcon from '@/icons/Analytics/windIcon';
import EditIcon from '@/icons/Analytics/EditIcon';
import DataTable from '../components/DataTable';
import CustomFields from '../components/CustomFields';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import {
  POLLUTANT_OPTIONS,
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
  tableData,
} from '../constants';
import Footer from '../components/Footer';

export const DownloadDataHeader = () => {
  return (
    <h3
      className="flex text-lg leading-6 font-medium text-gray-900"
      id="modal-title"
    >
      <button type="button" onClick={null}>
        <LongArrowLeft className="mr-2" />
      </button>
      Download air quality data
    </h3>
  );
};

const DataDownload = ({ onClose }) => {
  const userInfo = useSelector((state) => state.login.userInfo);
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

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
        setError('Please select a duration');
        return;
      }
      if (selectedSites.length === 0) {
        setError('Please select at least one location');
        return;
      }
      // Prepare data for API
      const apiData = {
        ...formData,
        selectedSites,
      };
      console.log('Submitting data to API:', apiData);

      // implementation for submit logic

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
    <>
      {/* section 1 */}
      <form
        className="w-[280px] h-[658px] relative bg-[#f6f6f7] space-y-3 px-5 pt-5 pb-14"
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
            selectedSites={selectedSites}
            setSelectedSites={setSelectedSites}
            clearSites={clearSelected}
          />
        </div>
        <Footer
          setError={setError}
          errorMessage={error}
          selectedSites={selectedSites}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
        />
      </div>
    </>
  );
};

DataDownload.propTypes = {
  onClose: PropTypes.func,
};

export default DataDownload;
