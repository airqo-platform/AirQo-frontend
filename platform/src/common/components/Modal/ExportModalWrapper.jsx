import Button from '@/components/Button';
import DownloadIcon from '@/icons/Analytics/download.svg';
import { roundToEndOfDay, roundToStartOfDay } from '@/core/utils/dateTime';
import moment from 'moment';
import CloseIcon from '@/icons/close_icon';

const ExportModalWrapper = ({
  open,
  onClose,
  children,
  downloadDataFunc,
  title,
  loading,
  ModalIcon,
  primaryButtonText = 'Export',
  data,
}) => {
  const startDate = data?.startDate
    ? moment(data.startDate).format('MMMM D, YYYY')
    : moment().subtract(5, 'days').format('MMMM D, YYYY');
  const endDate = data?.endDate
    ? moment(data.endDate).format('MMMM D, YYYY')
    : moment().format('MMMM D, YYYY');

  const handleCancel = () => {
    onClose();
  };

  const handleDataExport = async () => {
    let body = {
      sites: data?.sites,
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
    <dialog
      id='confirm_export_dialog'
      className={`${open ? 'visible modal modal-open' : 'hidden'} w-screen h-screen`}>
      <div className='modal-box p-0 w-[400px] h-auto pt-6 bg-white rounded-lg shadow border border-gray-50 flex-col justify-start items-center gap-6 flex'>
        <div className='self-stretch px-6 flex-col justify-start items-start gap-5 flex'>
          <div className='self-stretch flex-col justify-start items-start gap-2 flex'>
            <div className='flex w-full justify-between items-center'>
              <div className='p-5 bg-indigo-50 rounded-full border-indigo-50 justify-start items-start gap-1 flex'>
                {ModalIcon ? (
                  <ModalIcon className='w-6 h-6' />
                ) : (
                  <DownloadIcon className='w-6 h-6' />
                )}
              </div>
              <div
                onClick={() => {
                  onClose();
                  handleCancel();
                }}
                className='bottom-5 relative hover:bg-gray-100 rounded-full p-2 cursor-pointer'>
                <CloseIcon />
              </div>
            </div>
            <div className='self-stretch text-gray-700 text-lg font-medium leading-relaxed'>
              {title}
            </div>
            <div className='self-stretch'>
              <span className='text-slate-500 text-sm font-normal leading-tight'>
                The following report will start and end from:{' '}
              </span>
              <span className='text-gray-600 text-sm font-normal leading-tight'>
                {startDate} - {endDate}
              </span>
            </div>
          </div>
          <div className='flex-col justify-start items-start gap-[13px] flex w-full self-stretch'>
            {children}
          </div>
        </div>
        <div className='self-stretch p-5 bg-gray-50 border-gray-200 justify-end items-start gap-3 inline-flex w-full'>
          <Button onClick={handleCancel} variant='outlined' className='text-sm font-medium'>
            Cancel
          </Button>
          <Button
            variant={loading ? 'disabled' : 'filled'}
            className='text-sm font-medium'
            onClick={handleDataExport}>
            {loading ? 'Loading...' : primaryButtonText}
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default ExportModalWrapper;
