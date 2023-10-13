import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
const TopBarItem = ({ Icon, dropdown }) => {
  return (
    <div className='border border-grey-750 w-15 h-10 rounded-lg flex items-center justify-between gap-2 ml-3 p-[10px]'>
      <Icon />
      {dropdown && <ChevronDownIcon />}
    </div>
  );
};

export default TopBarItem;
