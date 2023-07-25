import InfoIcon from '@/icons/Common/info_circle.svg';
import DetailCard from './detail_card';

const ReportDetailCard = ({ data, open }) => {
  // Add report links
  // Adjust correlation & offset functionality
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
          {data.map((item, index) => (
            <DetailCard
              index={index}
              action={item.action}
              description={item.description}
              extra_message={item.extra_message}
              status={item.status}
              title={item.title}
            />
          ))}
        </div>
      </form>
    </dialog>
  );
};

export default ReportDetailCard;
