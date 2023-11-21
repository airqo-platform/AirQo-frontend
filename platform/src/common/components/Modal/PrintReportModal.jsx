import { useState } from 'react';
import AlertBox from '@/components/AlertBox';
import ExportModalWrapper from './ExportModalWrapper';
import ShareIcon from '@/icons/Analytics/share.svg';
import MailIcon from '@/icons/Settings/mail.svg';
import PlusIcon from '@/icons/Settings/plus.svg';
import Button from '@/components/Button';
import { isEmpty } from 'underscore';
import { exportDataApi, shareReportApi } from '@/core/apis/Analytics';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import autoTable from 'jspdf-autotable';

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
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    show: false,
  });
  const [emails, setEmails] = useState(['']);
  const [emailErrors, setEmailErrors] = useState([]);
  const userInfo = useSelector((state) => state.login.userInfo);
  // State for selected columns
  const [selectedColumns, setSelectedColumns] = useState({
    site_name: true,
    device_name: true,
    pm2_5_calibrated_value: true,
    pm10_calibrated_value: true,
    device_latitude: true,
    device_longitude: true,
    frequency: true,
    datetime: true,
  });

  // Function to handle checkbox change
  const handleCheckboxChange = (column) => {
    setSelectedColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  // Array of table columns
  const tableColumns = [
    'site_name',
    'device_name',
    'pm2_5_calibrated_value',
    'pm10_calibrated_value',
    'device_latitude',
    'device_longitude',
    'frequency',
    'datetime',
  ];

  // Mapping of column names
  const columnNamesMapping = {
    site_name: 'Site Name',
    device_name: 'Device Name',
    pm2_5_calibrated_value: 'PM2.5 Value',
    pm10_calibrated_value: 'PM10 Value',
    device_latitude: 'Latitude',
    device_longitude: 'Longitude',
    frequency: 'Frequency',
    datetime: 'Date & Time',
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);

    if (!isEmpty(value)) {
      const updatedEmailErrors = [...emailErrors];
      updatedEmailErrors[index] = isValidEmail(value) ? '' : 'Invalid email';
      setEmailErrors(updatedEmailErrors);
    }
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    const updatedEmails = [...emails];
    updatedEmails.splice(index, 1);
    setEmails(updatedEmails);
  };

  const isValidEmail = (email) => {
    // Email validation regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is not empty and matches the regex pattern
    if (email && email.match(emailRegex)) {
      return true; // Email is valid and not empty
    }

    return false; // Email is either empty or invalid
  };

  const handleCancel = () => {
    setEmails(['']);
    setEmailErrors([]);
    onClose();
    setSelectedColumns({
      site_name: true,
      device_name: true,
      pm2_5_calibrated_value: true,
      pm10_calibrated_value: true,
      device_latitude: true,
      device_longitude: true,
      frequency: true,
      datetime: true,
    });
  };

  const downloadDataFunc = () => {
    try {
      handlePrintPDF();

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
      setAlert({
        type: 'error',
        message: 'An error occurred while exporting data',
        show: true,
      });
      setLoading(false);
    }
  };

  const handleDataExport = () => {
    setLoading(true);
    downloadDataFunc();
  };

  // Function to generate CSV file
  const generateCsv = (data) => {
    const dataArr = data.map((row) => {
      const dataRow = {};
      Object.keys(selectedColumns).forEach((column) => {
        if (selectedColumns[column]) {
          dataRow[columnNamesMapping[column]] = row[column];
        }
      });
      return dataRow;
    });

    const csv = Papa.unparse(dataArr);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airquality-data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    return new Blob([csv], { type: 'text/csv' });
  };

  // Function to generate PDF file
  const generatePdf = (data) => {
    const doc = new jsPDF('p', 'pt');
    const tableRows = [];

    data.forEach((row) => {
      const dataRow = {};
      Object.keys(selectedColumns).forEach((column) => {
        if (selectedColumns[column]) {
          dataRow[columnNamesMapping[column]] = row[column];
        }
      });
      tableRows.push(dataRow);
    });

    doc.autoTable({
      columns: Object.keys(selectedColumns)
        .filter((column) => selectedColumns[column])
        .map((col) => ({
          header: columnNamesMapping[col],
          dataKey: columnNamesMapping[col],
        })),
      body: tableRows,
      startY: 60,
    });

    doc.text('Air quality data', 14, 15);
    doc.text(`From: ${data[0].date} - To: ${data[data.length - 1].date}`, 14, 30);

    doc.save('air_quality_data.pdf');

    return doc.output('blob');
  };

  const handleShareReport = async (usebody) => {
    try {
      if (emails.length === 0 || (emails.length === 1 && emails[0] === '')) {
        setAlert({
          type: 'error',
          message: 'Please enter at least one email',
          show: true,
        });
        return;
      }

      setLoading(true);

      await exportDataApi(usebody).then((resData) => {
        let file;
        switch (format) {
          case 'pdf':
            file = generatePdf(resData.data);
            break;

          case 'csv':
            file = generateCsv(resData.data);
            break;

          default:
            console.log('default case');
        }

        const formData = new FormData();
        formData.append('recepientEmails', JSON.stringify([...emails]));
        formData.append('senderEmail', userInfo.email);
        formData.append(format, file);

        shareReportApi(formData)
          .then((res) => {
            setAlert({
              type: 'success',
              message: 'Air quality data shared successful',
              show: true,
            });
            handleCancel();
            shareStatus('Report shared');
          })
          .catch((err) => {
            setAlert({
              type: 'error',
              message: 'An error occurred while sharing the report. Please try again.',
              show: true,
            });
          });
      });
    } catch (error) {
      console.error(error, 'error');
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
                      {columnNamesMapping[column]}
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
