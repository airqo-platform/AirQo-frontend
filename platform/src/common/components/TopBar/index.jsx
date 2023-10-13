import SearchMdIcon from '@/icons/Common/search_md.svg';
import Avatar from '@/icons/Topbar/avatar.svg';
import TopBarItem from './TopBarItem';

const TopBar = ({ topbarTitle, noBorderBottom }) => {
  return (
    <nav
      className={`sticky top-0 z-10 bg-white w-full px-4 py-4 lg:py-0 h-[76px] lg:px-16 ${
        !noBorderBottom && 'border-b-[1px] border-b-grey-750'
      }`}
    >
      <div className='justify-between  items-center flex bg-white py-4'>
        <div className='font-medium invisible lg:visible text-2xl text-neutral-light-800'>
          {topbarTitle}
        </div>
        <div className='invisible lg:visible sm:flex  justify-end md:justify-between items-center '>
          <div className='flex w-auto'>
            <TopBarItem Icon={SearchMdIcon} />
            <TopBarItem Icon={Avatar} dropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
