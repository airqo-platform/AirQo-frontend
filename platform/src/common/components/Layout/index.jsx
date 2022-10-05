import SideBar from '@/components/SideBar';
import TopBar from '@/components/TopBar';

const Layout = ({ children }) => (
  <div className='relative w-screen h-screen'>
    <TopBar />
    <div className='relative md:grid md:grid-cols-6 h-screen pt-16'>
      <SideBar />
      <div className='md:col-span-5'>{children}</div>
    </div>
  </div>
);

export default Layout;
