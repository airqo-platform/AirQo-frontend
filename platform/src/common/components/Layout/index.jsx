import SideBar from '../SideBar';
import TopBar from '../TopBar';

const Layout = ({ children }) => (
  <div className='relative w-screen h-screen'>
    <TopBar />
    <div className='relative grid grid-cols-6 h-screen pt-16'>
      <SideBar />
      <div className='col-span-5'>{children}</div>
    </div>
  </div>
);

export default Layout;
