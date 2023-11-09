import Button from '@/components/Button';
import { useState } from 'react';
import DownloadIcon from '@/icons/Settings/download.svg';

const ConfirmExportModal = ({ open, onClose, data }) => {
  const exportFormats = ['csv', 'json', 'pdf'];
  const [selectedFormat, setSelectedFormat] = useState('');

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleCancel = () => {
    setSelectedFormat('');
    onClose();
  };

  const handleDataExport = () => {};

  return (
    <dialog
      id='confirm_export_dialog'
      className={`${open ? 'visible modal modal-open' : 'hidden'} w-screen h-screen`}
    >
      <div className='modal-box p-0 w-[400px] h-auto pt-6 bg-white rounded-lg shadow border border-gray-50 flex-col justify-start items-center gap-6 flex'>
        <div className='self-stretch px-6 flex-col justify-start items-start gap-5 flex'>
          <div className='self-stretch flex-col justify-start items-start gap-2 flex'>
            <div className='p-5 bg-indigo-50 rounded-full border-indigo-50 justify-start items-start gap-1 flex'>
              <DownloadIcon className='w-6 h-6' />
            </div>
            <div className='self-stretch text-gray-700 text-lg font-medium leading-relaxed'>
              Export your report
            </div>
            <div className='self-stretch'>
              <span className='text-slate-500 text-sm font-normal leading-tight'>
                The following report will start and end from:{' '}
              </span>
              <span className='text-gray-600 text-sm font-normal leading-tight'>
                {data.start_date} - {data.end_date}
              </span>
            </div>
          </div>
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
        </div>
        <div className='self-stretch p-5 bg-gray-50 border-gray-200 justify-end items-start gap-3 inline-flex w-full'>
          <Button onClick={handleCancel} variant='outlined' className='text-sm font-medium'>
            Cancel
          </Button>
          <Button variant='filled' className='text-sm font-medium' onClick={handleDataExport}>
            Export
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmExportModal;
