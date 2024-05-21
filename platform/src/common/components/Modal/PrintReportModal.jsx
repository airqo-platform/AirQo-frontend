import { useState } from 'react';
import AlertBox from '@/components/AlertBox';
import ExportModalWrapper from './ExportModalWrapper';
import ShareIcon from '@/icons/Analytics/share.svg';
import MailIcon from '@/icons/Settings/mail.svg';
import PlusIcon from '@/icons/Settings/plus.svg';
import Button from '@/components/Button';
import { exportDataApi, shareReportApi } from '@/core/apis/Analytics';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tableColumns = [
  'site_name',
  'device_name',
  'pm2_5_raw_value',
  'pm10_raw_value',
  'device_latitude',
  'device_longitude',
  'frequency',
  'datetime',
];

const INITIAL_COLUMNS_STATE = {
  site_name: true,
  device_name: true,
  pm2_5_raw_value: true,
  pm10_raw_value: true,
  device_latitude: true,
  device_longitude: true,
  frequency: true,
  datetime: true,
};

const COLUMN_NAMES_MAPPING = {
  site_name: 'Site Name',
  device_name: 'Device Name',
  pm2_5_raw_value: 'PM2.5 Value',
  pm10_raw_value: 'PM10 Value',
  device_latitude: 'Latitude',
  device_longitude: 'Longitude',
  frequency: 'Frequency',
  datetime: 'Date & Time',
};

const PrintReportModal = ({
  open,
  onClose,
  handlePrintPDF,
  data,
  title,
  format,
  btnText,
  shareModel,
  shareStatus,
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const [emails, setEmails] = useState(['']);
  const [emailErrors, setEmailErrors] = useState([]);
  const userInfo = useSelector((state) => state.login.userInfo);
  const [selectedColumns, setSelectedColumns] = useState(INITIAL_COLUMNS_STATE);
  const chartData = useSelector((state) => state.chart);
  const startDate = moment(chartData.chartDataRange.startDate).format('MMMM D, YYYY');
  const endDate = moment(chartData.chartDataRange.endDate).format('MMMM D, YYYY');

  const handleCheckboxChange = (column) => {
    setSelectedColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);

    if (value.trim()) {
      const updatedEmailErrors = [...emailErrors];
      updatedEmailErrors[index] = EMAIL_REGEX.test(value) ? '' : 'Invalid email';
      setEmailErrors(updatedEmailErrors);
    }
  };

  const handleAddEmail = () => setEmails([...emails, '']);
  const handleRemoveEmail = (index) => setEmails(emails.filter((_, i) => i !== index));
  const handleCancel = () => {
    setEmails(['']);
    setEmailErrors([]);
    onClose();
    setSelectedColumns(INITIAL_COLUMNS_STATE);
  };

  /**
   * Download data
   * @returns {void}
   * */
  const downloadDataFunc = async () => {
    try {
      await handlePrintPDF();
      setLoading(false);
      setTimeout(
        () =>
          setAlert({
            type: 'success',
            message: 'Air quality data download successful',
            show: true,
          }),
        7000,
      );
      handleCancel();
    } catch (err) {
      setAlert({ type: 'error', message: 'An error occurred while exporting data', show: true });
      setLoading(false);
    }
  };

  const handleDataExport = () => {
    setLoading(true);
    downloadDataFunc();
  };

  /**
   * Generate CSV
   * @param {array} data - Data
   * @returns {Blob} CSV Blob
   * */
  const generateCsv = (data) => {
    const dataArr = data.map((row) => {
      return Object.keys(selectedColumns).reduce((dataRow, column) => {
        if (selectedColumns[column]) {
          dataRow[COLUMN_NAMES_MAPPING[column]] = row[column];
        }
        return dataRow;
      }, {});
    });

    const csv = Papa.unparse(dataArr);
    const blob = new Blob([csv], { type: 'text/csv' });

    return blob;
  };

  /**
   * Generate PDF
   * @param {array} data - Data
   * @returns {Blob} PDF Blob
   * */
  const generatePdf = (data) => {
    const doc = new jsPDF('p', 'pt');
    const selectedColumnKeys = Object.keys(selectedColumns).filter(
      (column) => selectedColumns[column],
    );

    const tableRows = data.map((row) => {
      return selectedColumnKeys.reduce((dataRow, column) => {
        dataRow[COLUMN_NAMES_MAPPING[column]] = row[column];
        return dataRow;
      }, {});
    });

    const pageCenter = doc.internal.pageSize.getWidth() / 2;

    doc.setFontSize(18);
    doc.text('Air quality data', pageCenter, 30, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`${startDate} - ${endDate}`, pageCenter, 55, { align: 'center' });

    autoTable(doc, {
      columns: selectedColumnKeys.map((col) => ({
        header: COLUMN_NAMES_MAPPING[col],
        dataKey: COLUMN_NAMES_MAPPING[col],
      })),
      body: tableRows,
      startY: 60,
    });

    return doc.output('blob');
  };

  /**
   * Share report
   * @param {object} usebody - Request body
   * @returns {void}
   * */
  const handleShareReport = async (usebody) => {
    if (!emails.length || (emails.length === 1 && !emails[0].trim())) {
      setAlert({ type: 'error', message: 'Please enter at least one email', show: true });
      return;
    }

    setLoading(true);

    try {
      const resData = await exportDataApi(usebody);
      let file;
      switch (format) {
        case 'pdf':
          file = generatePdf(resData.data);
          break;
        case 'csv':
          file = generateCsv(resData.data);
          break;
        default:
          return;
      }

      const formData = new FormData();
      formData.append('recepientEmails', JSON.stringify([...emails]));
      formData.append('senderEmail', userInfo.email);
      formData.append(format, file);

      const response = await shareReportApi(formData);
      if (response.success) {
        setAlert({ type: 'success', message: 'Air quality data shared successful', show: true });
        handleCancel();
        shareStatus('Report shared');
      } else {
        setAlert({
          type: 'error',
          message: 'An error occurred while sharing the report',
          show: true,
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An error occurred while sharing the report. Please try again.',
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ExportModalWrapper
        title={title}
        open={open}
        onClose={() => {
          onClose;
          handleCancel();
        }}
        downloadDataFunc={shareModel ? handleShareReport : handleDataExport}
        loading={loading}
        ModalIcon={ShareIcon}
        primaryButtonText={btnText || 'Print'}
        data={data}>
        {shareModel && (
          <>
            <div className='w-full'>
              <AlertBox
                type={alert.type}
                message={alert.message}
                show={alert.show}
                hide={() => setAlert({ ...alert, show: false })}
              />
            </div>
            <div>
              <div className='self-stretch pr-2 justify-start items-start inline-flex'>
                <div className='text-gray-700 text-base font-medium leading-tight'>
                  Deselect Columns for Report
                </div>
              </div>
              <div className='flex flex-wrap'>
                {tableColumns.map((column, index) => (
                  <div key={index} className='w-1/2 flex items-center space-x-2 p-1'>
                    <input
                      type='checkbox'
                      id={column}
                      checked={selectedColumns[column]}
                      onChange={() => handleCheckboxChange(column)}
                      className='form-checkbox h-5 w-5 text-blue-600 rounded'
                    />
                    <label htmlFor={column} className='text-gray-700 text-sm font-medium'>
                      {COLUMN_NAMES_MAPPING[column]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className='self-stretch pr-2 justify-start items-start gap-2.5 inline-flex'>
              <div className='text-gray-700 text-base font-medium leading-tight'>Send to email</div>
            </div>

            {emails.map((email, index) => (
              <div key={index} className='w-full'>
                <div className='relative w-full' key={index}>
                  <input
                    type='text'
                    placeholder='Enter email'
                    className='input input-bordered w-full pl-9 placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border rounded-md'
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <MailIcon />
                  </div>
                  {index > 0 && (
                    <button
                      className='absolute inset-y-0 right-0 flex justify-center items-center mr-3 pointer-events-auto'
                      onClick={() => handleRemoveEmail(index)}>
                      ✕
                    </button>
                  )}
                </div>
                {emailErrors[index] && email && (
                  <div className='relative flex justify-end pr-3'>
                    <span className='text-xs text-red-500'>{emailErrors[index]}</span>
                  </div>
                )}
              </div>
            ))}

            <div>
              <Button
                className='text-sm font-medium text-primary-600 leading-5 gap-2 h-5 mt-3 mb-8 w-auto pl-0'
                onClick={handleAddEmail}>
                <PlusIcon /> <span>Add email</span>
              </Button>
            </div>
          </>
        )}
      </ExportModalWrapper>
    </div>
  );
};

export default PrintReportModal;
