import { useState, useCallback } from 'react';
import { exportDataApi } from '@/core/apis/Analytics';
import Papa from 'papaparse';
import { roundToEndOfDay, roundToStartOfDay } from '@/core/utils/dateTime';
import AlertBox from '@/components/AlertBox';
import moment from 'moment';
import { useSelector } from 'react-redux';
import ExportModalWrapper from './ExportModalWrapper';

const ConfirmExportModal = ({ open, onClose, handleExportPDF, data }) => {
  const exportFormats = [
    'csv',
    'json',
    // 'pdf'
  ];
  const [selectedFormat, setSelectedFormat] = useState(exportFormats[0]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '', show: false });

  const chartData = useSelector((state) => state.chart);
  const startDate = moment(chartData.chartDataRange.startDate).format(
    'MMMM D, YYYY',
  );
  const endDate = moment(chartData.chartDataRange.endDate).format(
    'MMMM D, YYYY',
  );

  const handleFormatChange = (event) => setSelectedFormat(event.target.value);

  /**
   * Handle cancel button click
   * @returns {void}
   * */
  const handleCancel = () => {
    setSelectedFormat(exportFormats[0]);
    onClose();
  };

  /**
   * Export data
   * @param {object} data - Data to export
   * @param {string} fileName - File name
   * @param {string} type - File type
   * @returns {void}
   * */
  const exportData = (data, fileName, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Download data
   * @param {object} body - Request body
   * @returns {void}
   * */
  const downloadDataFunc = useCallback(
    async (body) => {
      try {
        const response = await exportDataApi(body);
        const resData = response.data;
        const filename = `airquality-data.${selectedFormat}`;

        if (selectedFormat === 'json') {
          const jsonString = JSON.stringify(resData);
          exportData(jsonString, filename, 'application/json');
        } else if (selectedFormat === 'csv') {
          const csvData = Papa.unparse(resData);
          exportData(csvData, filename, 'text/csv;charset=utf-8;');
        } else if (selectedFormat === 'pdf') {
          handleExportPDF();
        }

        setAlert({
          type: 'success',
          message: 'Air quality data download successful',
          show: true,
        });
        setTimeout(
          () => setAlert({ type: '', message: '', show: false }),
          7000,
        );
        handleCancel();
      } catch (err) {
        const message =
          err.response &&
          err.response.data &&
          err.response.data.status === 'success'
            ? 'Uh-oh! No data found for the selected parameters.'
            : 'An error occurred while exporting data';
        setAlert({ type: 'error', message, show: true });
      } finally {
        setLoading(false);
      }
    },
    [selectedFormat],
  );

  /**
   * Handle data export
   * @returns {void}
   * */
  const handleDataExport = useCallback(() => {
    setLoading(true);

    const body = {
      sites: data?.sites,
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: 'hourly',
      pollutants: ['pm2_5', 'pm10'],
      downloadType: 'json',
      outputFormat: 'airqo-standard',
    };
    downloadDataFunc(body);
  }, [startDate, endDate, downloadDataFunc]);

  return (
    <div>
      <ExportModalWrapper
        title="Export your report"
        open={open}
        onClose={onClose}
        downloadDataFunc={handleDataExport}
        loading={loading}
      >
        <div className="flex-col justify-start items-start gap-[13px] flex">
          <AlertBox
            type={alert.type}
            message={alert.message}
            show={alert.show}
            hide={() => setAlert({ ...alert, show: false })}
          />
          <div className="self-stretch pr-2 justify-start items-start gap-2.5 inline-flex">
            <div className="text-gray-700 text-base font-medium leading-tight">
              Export as
            </div>
          </div>

          {exportFormats.map((format, index) => (
            <div
              className="justify-start items-start gap-2 inline-flex"
              key={index}
              data-testid="selectedFormat-format"
            >
              <input
                type="radio"
                name="selectedFormat"
                value={format}
                checked={selectedFormat === format}
                onChange={handleFormatChange}
              />
              <div className="inline-flex flex-col">
                <span className="self-stretch text-gray-600 text-sm font-medium leading-tight uppercase">
                  {format}
                </span>
                {format === 'csv' && (
                  <span className="text-gray-500 text-sm font-normal leading-tight">
                    Report will be exported as a CSV(comma separated values)
                    table.
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
