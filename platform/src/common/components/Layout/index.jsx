import SideBar from '@/components/SideBar';
import TopBar from '@/components/TopBar';

const Layout = ({ children }) => (
  <div className='relative w-screen h-screen bg-white overflow-x-hidden'>
    <div className='relative lg:flex w-screen h-screen'>
      <div>
        <SideBar />
      </div>
      <div className='w-full overflow-x-hidden'>
        <TopBar />
        {children}
      </div>
    </div>
  </div>
);

export default Layout;
