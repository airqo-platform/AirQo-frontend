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

  const PlaceholderImage = `https://ui-avatars.com/api/?name=${userInfo.firstName}+${userInfo.lastName}&background=random`;

  const handleDropdownClick = (event) => {
    event.stopPropagation();
  };

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
      data-cy='topbar'
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
              <button
                data-cy='profile-btn'
                className='focus:outline-none'
                type='button'
                onClick={handleDropdown}>
                <TopBarItem Image={userInfo.profilePicture || PlaceholderImage} dropdown />
              </button>
              {dropdownVisible && (
                <div
                  data-cy='topbar-dropdown-menu'
                  onClick={handleDropdownClick}
                  className='dropdown-menu w-60 h-auto border border-gray-200 absolute bg-white mt-1 right-0 shadow-lg rounded-lg overflow-hidden'>
                  <div class='flex items-center space-x-4 p-2'>
                    <div class='relative'>
                      <img
                        class='w-10 h-10 rounded-full'
                        src={userInfo.profilePicture || PlaceholderImage}
                        alt=''
                      />
                      <span class='bottom-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full'></span>
                    </div>
                    <div
                      class='font-medium dark:text-white'
                      style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                      <div
                        className='capitalize'
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '14ch',
                        }}>
                        {userInfo?.firstName + ' ' + userInfo?.lastName}
                      </div>

                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '21ch',
                        }}
                        class='text-xs text-gray-500 dark:text-gray-400 w-full'>
                        {userInfo?.email}
                      </div>
                    </div>
                  </div>

                  <hr className='dropdown-divider border-b border-gray-200 dark:border-gray-700' />
                  <ul className='dropdown-list p-2'>
                    <li
                      onClick={handleLogout}
                      className='logout-option text-gray-500 hover:text-gray-600 cursor-pointer p-2'>
                      Log out
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
