import InfoIcon from '@/icons/Common/info_circle.svg';
import Button from '@/components/Button';

const STATUS_COLOR_CODES = {
  passed: 'bg-green-200',
  failed: 'bg-red-200',
  running: 'bg-turquoise-200',
  scheduled: 'bg-yellow-200',
  overdue: 'bg-red-200',
  re_run_required: 'bg-red-200',
  error: 'bg-red-200',
};

const DetailCard = ({
  index,
  action,
  description,
  extra_message,
  status,
  title,
  handleReportClick,
}) => (
  <div
    key={index}
    className={`self-stretch p-4 ${
      STATUS_COLOR_CODES[status.toLowerCase()]
    } flex-col justify-start items-start gap-3 flex`}
  >
    <div className='flex-col justify-start items-start gap-1 flex'>
      <div className='justify-start items-start gap-1.5 inline-flex'>
        <div className='text-gray-700 text-sm font-semibold leading-none'>{title}</div>
      </div>
      <div className='text-gray-700 text-sm leading-none'>{description}</div>
    </div>
    <div className='flex flex-col md:flex-row justify-start items-start md:self-stretch md:justify-between md:items-center gap-4 md:inline-flex'>
      <div className='justify-start items-center gap-1.5 flex'>
        <div className='w-3.5 h-3.5 relative'>
          <InfoIcon />
        </div>
        <div className='text-gray-700 text-sm leading-none max-w-[250px]'>{extra_message}</div>
      </div>
      <div className='h-4 justify-end items-center gap-4 flex'>
        <div className='text-gray-700 text-sm leading-none'>
          <button className='hover:underline' onClick={handleReportClick}>
            Full Report
          </button>
        </div>
        <div className='text-gray-700 text-sm leading-none'>{action}</div>
      </div>
    </div>
  </div>
);

export default DetailCard;
