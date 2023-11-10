import { useState } from 'react';
import { exportDataApi } from '@/core/apis/Analytics';
import Papa from 'papaparse';
import { roundToEndOfDay, roundToStartOfDay } from '@/core/utils/dateTime';
import AlertBox from '@/components/AlertBox';
import moment from 'moment';
import ExportModalWrapper from './ExportModalWrapper';

const ConfirmExportModal = ({ open, onClose, handleExportPDF }) => {
  const exportFormats = ['csv', 'json', 'pdf'];
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    show: false,
  });
  const startDate = moment().subtract(5, 'days').format('MMMM D, YYYY');
  const endDate = moment().format('MMMM D, YYYY');

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleCancel = () => {
    setSelectedFormat('');
    onClose();
  };

  const exportData = (data, fileName, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadDataFunc = async (body) => {
    try {
      const response = await exportDataApi(body);
      const resData = response.data;
      let filename = `airquality-data.${selectedFormat}`;

      if (selectedFormat === 'json') {
        const jsonString = JSON.stringify(resData);
        exportData(jsonString, filename, 'application/json');
      }

      if (selectedFormat === 'csv') {
        // Convert JSON data to CSV using Papa Parse
        const csvData = Papa.unparse(resData);
        exportData(csvData, filename, 'text/csv;charset=utf-8;');
      }

      if (selectedFormat === 'pdf') {
        handleExportPDF();
      }

      setAlert({
        type: 'success',
        message: 'Air quality data download successful',
        show: true,
      });
      setLoading(false);
      setTimeout(() => {
        setAlert({
          type: 'success',
          message: 'Air quality data download successful',
          show: true,
        });
      }, 7000);
      handleCancel();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.status === 'success') {
        setAlert({
          type: 'success',
          message: 'Uh-oh! No data found for the selected parameters.',
          show: true,
        });
      } else {
        setAlert({
          type: 'error',
          message: 'An error occurred while exporting data',
          show: true,
        });
      }
      setLoading(false);
    }
  };

  const handleDataExport = () => {
    setLoading(true);

    let body = {
      sites: [
        '647f3a5d69df500029a2fc93',
        '6461df90dab86000293ba49f',
        '64aafb1843e5f70029a059c4',
        '6373928b7c737c001e78554f',
      ],
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: 'hourly',
      pollutants: ['pm2_5', 'pm10'],
      downloadType: 'json',
      outputFormat: 'airqo-standard',
    };
    downloadDataFunc(body);
  };

  return (
    <div>
      <AlertBox
        type={alert.type}
        message={alert.message}
        show={alert.show}
        hide={() => setAlert({ ...alert, show: false })}
      />
      <ExportModalWrapper
        title='Export your report'
        open={open}
        onClose={onClose}
        downloadDataFunc={handleDataExport}
        loading={loading}
      >
        <div className='flex-col justify-start items-start gap-[13px] flex'>
          <div className='self-stretch pr-2 justify-start items-start gap-2.5 inline-flex'>
            <div className='text-gray-700 text-base font-medium leading-tight'>Export as</div>
          </div>

          {exportFormats.map((format, index) => (
            <div
              className='justify-start items-start gap-2 inline-flex'
              key={index}
              data-testid='selectedFormat-format'
            >
              <input
                type='radio'
                name='selectedFormat'
                value={format}
                checked={selectedFormat === format}
                onChange={handleFormatChange}
              />
              <div className='inline-flex flex-col'>
                <span className='self-stretch text-gray-600 text-sm font-medium leading-tight uppercase'>
                  {format}
                </span>
                {format === 'csv' && (
                  <span className='text-gray-500 text-sm font-normal leading-tight'>
                    Report will be exported as a CSV(comma separated values) table.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ExportModalWrapper>
    </div>
  );
};

export default ConfirmExportModal;
