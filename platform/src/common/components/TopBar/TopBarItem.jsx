import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
const TopBarItem = ({ Icon, Image, dropdown }) => {
  return (
    <div className='border border-grey-750 w-15 h-10 rounded-lg flex items-center justify-between gap-2 ml-3 p-[10px]'>
      {Image ? <img className='w-5 h-5 rounded-full' src={Image} alt='profile-pic' /> : <Icon />}
      {dropdown && <ChevronDownIcon />}
    </div>
  );
};

export default TopBarItem;
