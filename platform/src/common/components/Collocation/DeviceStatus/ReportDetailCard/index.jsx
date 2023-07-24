import InfoIcon from '@/icons/Common/info_circle.svg';

const ReportDetailCard = ({ data, open }) => {
  return (
    <dialog className={`modal ${open && 'modal-open'} w-screen h-screen`}>
      <form
        method='dialog'
        className='modal-box p-0 overflow-hidden rounded max-w-2xl w-full h-full shadow border border-slate-100'
      >
        <div className='flex justify-between items-center p-5 border-b border-b-gray-200'>
          <div className='text-black text-base font-medium'>Status summary</div>
          <button className='btn btn-sm btn-circle btn-ghost'>✕</button>
        </div>
        <div className='self-stretch px-5 pt-4 sm:pb-20 pb-10 flex-col justify-start items-start gap-3.5 flex h-full overflow-y-auto'>
          <div className='self-stretch p-4 bg-emerald-100 flex-col justify-start items-start gap-3 flex'>
            <div className='flex-col justify-start items-start gap-1 flex'>
              <div className='justify-start items-start gap-1.5 inline-flex'>
                <div className='text-gray-700 text-sm font-semibold leading-none'>
                  Intra sensor correlation value is 0.99
                </div>
              </div>
              <div className='text-gray-700 text-sm leading-none'>
                Acceptable device to device correlation and device intra-sensor correlations are set
                to R ≥ 0.99 and R2 ≥0.98
              </div>
            </div>
            <div className='flex flex-col md:flex-row justify-start items-start md:self-stretch md:justify-between md:items-center gap-4 md:inline-flex'>
              <div className='justify-start items-center gap-1.5 flex'>
                <div className='w-3.5 h-3.5 relative'>
                  <InfoIcon />
                </div>
                <div className='text-gray-700 text-sm leading-none'>
                  Meets recommended correlation
                </div>
              </div>
              <div className='h-4 justify-end items-start gap-4 flex'>
                <div className='text-gray-700 text-sm leading-none'>Full Report</div>
                <div className='text-gray-700 text-sm leading-none'>Adjust Correlation</div>
              </div>
            </div>
          </div>
          <div className='self-stretch p-4 bg-red-100 flex-col justify-start items-start gap-3 flex'>
            <div className='flex-col justify-start items-start gap-1 flex'>
              <div className='justify-start items-start gap-1.5 inline-flex'>
                <div className='text-gray-700 text-sm font-semibold'>
                  Collocation period is less than 7 days
                </div>
              </div>
              <div className='text-gray-700 text-sm leading-none'>
                Newly built AirQo devices are checked and validated for consistency in the
                laboratory environment for a period not less than 7 days
              </div>
            </div>
            <div className='flex flex-col md:flex-row justify-start items-start md:self-stretch md:justify-between md:items-center gap-4 md:inline-flex'>
              <div className='justify-start items-center gap-1.5 flex'>
                <div className='w-3.5 h-3.5 relative'>
                  <InfoIcon />
                </div>
                <div className='text-gray-700 text-sm leading-none'>
                  Less than recommended period
                </div>
              </div>
              <div className='h-4 justify-end items-start gap-4 flex'>
                <div className='text-gray-700 text-sm leading-none'>Full Report</div>
                <div className='text-gray-700 text-sm leading-none'>Adjust Standards</div>
              </div>
            </div>
          </div>
          <div className='self-stretch p-4 bg-red-100 flex-col justify-start items-start gap-3 flex'>
            <div className='flex-col justify-start items-start gap-1 flex'>
              <div className='justify-start items-start gap-1.5 inline-flex'>
                <div className='text-gray-700 text-sm font-semibold leading-none'>
                  Hourly and daily data offset and daily averages +/- 5 µg/m3
                </div>
              </div>
              <div className='text-gray-700 text-sm leading-none'>
                Data offset should be +/- 5 µg/m3 for both hourly and daily averages for the testing
                period, outside which the monitor is recalled for diagnosis and fault-fixing
              </div>
            </div>
            <div className='flex flex-col md:flex-row justify-start items-start md:self-stretch md:justify-between md:items-center gap-4 md:inline-flex'>
              <div className='justify-start items-center gap-1.5 flex'>
                <div className='w-3.5 h-3.5 relative'>
                  <InfoIcon />
                </div>
                <div className='text-gray-700 text-sm leading-none'>
                  Doesn’t meet recommended data offset
                </div>
              </div>
              <div className='h-4 justify-end items-start gap-4 flex'>
                <div className='text-gray-700 text-sm leading-none'>Full Report</div>
                <div className='text-gray-700 text-sm leading-none'>Adjust Offset</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default ReportDetailCard;
