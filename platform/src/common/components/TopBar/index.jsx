import { useState, useEffect } from 'react';
import SearchMdIcon from '@/icons/Common/search_md.svg';
import Avatar from '@/icons/Topbar/avatar.svg';
import TopBarItem from './TopBarItem';
import { useRouter } from 'next/router';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { useSelector, useDispatch } from 'react-redux';

const TopBar = ({ topbarTitle, noBorderBottom }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleDropdown = (event) => {
    event.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.clear();
    dispatch(resetStore());
    router.push('/account/login');
  };

  useEffect(() => {
    const hideDropdown = () => {
      setDropdownVisible(false);
    };

    if (dropdownVisible) {
      window.addEventListener('click', hideDropdown);
    }

    return () => {
      window.removeEventListener('click', hideDropdown);
    };
  }, [dropdownVisible]);

  return (
    <nav
      className={`sticky top-0 z-10 bg-white w-full px-4 py-4 lg:py-0 h-[76px] lg:px-16 ${
        !noBorderBottom && 'border-b-[1px] border-b-grey-750'
      }`}>
      <div className='justify-between items-center flex bg-white py-4'>
        <div className='font-medium invisible lg:visible text-2xl text-neutral-light-800'>
          {topbarTitle}
        </div>
        <div className='invisible lg:visible sm:flex justify-end md:justify-between items-center '>
          <div className='flex w-auto'>
            <TopBarItem Icon={SearchMdIcon} />
            <div className='relative'>
              <button className='focus:outline-none' type='button' onClick={handleDropdown}>
                <TopBarItem Icon={Avatar} dropdown />
              </button>
              {dropdownVisible && (
                <div className='dropdown-menu w-60 h-auto border border-gray-200 absolute bg-white right-0 shadow-lg rounded-lg'>
                  <div className='user-info flex p-2 gap-4'>
                    <img
                      src={userInfo.profilePicture}
                      alt=''
                      className='profile-pic rounded-full w-15 h-15'
                    />
                    <span>
                      <h1 className='username text-lg text-gray-500 font-medium capitalize'>
                        {userInfo?.firstName + ' ' + userInfo?.lastName}
                      </h1>
                      <p className='email text-sm text-gray-500'>{userInfo?.email}</p>
                    </span>
                  </div>
                  <hr className='dropdown-divider border-b border-gray-200 dark:border-gray-700' />
                  <ul className='dropdown-list p-2'>
                    <li
                      onClick={handleLogout}
                      className='logout-option text-red-500 hover:text-red-600 cursor-pointer p-2'>
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
