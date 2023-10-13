import SideBar from '@/components/SideBar';
import TopBar from '@/components/TopBar';

const Layout = ({ children, topbarTitle, noBorderBottom }) => (
  <div className=' w-screen h-screen  overflow-x-hidden'>
    <div className=' lg:flex w-screen h-screen'>
      <div>
        <SideBar />
      </div>
      <div className='w-full overflow-x-hidden'>
        <TopBar topbarTitle={topbarTitle} noBorderBottom={noBorderBottom} />
        {children}
      </div>
    </div>
  </div>
);

export default Layout;
