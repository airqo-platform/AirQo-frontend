import SearchMdIcon from '@/icons/Common/search_md.svg';
import Avatar from '@/icons/Topbar/avatar.svg';
import TopBarItem from './TopBarItem';

const TopBar = ({ topbarTitle, noBorderBottom }) => {
  return (
    <nav
      className={`sticky top-0 z-10 bg-white w-full sm:px-4 py-3 px-4 lg:px-6 ${
        !noBorderBottom && 'border-b-[1px] border-b-grey-750'
      }`}
    >
      <div className='justify-between  items-center flex bg-white'>
        <div className='font-medium invisible lg:visible text-2xl text-black-200'>
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
