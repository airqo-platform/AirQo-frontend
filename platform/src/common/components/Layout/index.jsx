import SideBar from '@/components/SideBar';
import TopBar from '@/components/TopBar';

const Layout = ({ children }) => (
  <div className='relative w-screen h-screen'>
    <TopBar />
    <div className='relative md:flex w-screen h-screen pt-16'>
      <SideBar />
      <div className='w-full'>{children}</div>
    </div>
  </div>
);

export default Layout;
