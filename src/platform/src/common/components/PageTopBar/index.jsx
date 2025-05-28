import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../Button';
import MenuBarIcon from '@/icons/menu_bar';
import ChartIcon from '@/icons/Topbar/chartIcon';
import {
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';

const PageTopBar = ({ topbarTitle, noBorderBottom, showSearch = false }) => {
  const dispatch = useDispatch();
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);

  const handleDrawer = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(setToggleDrawer(!togglingDrawer));
      dispatch(setSidebar(false));
    },
    [dispatch, togglingDrawer],
  );

  return (
    <div className="space-y-3 hidden lg:block">
      <nav
        className={`z-50 w-full py-2 px-2 md:px-0 rounded-xl bg-white shadow-sm border border-gray-200 lg:shadow-none lg:bg-transparent lg:border-none ${!noBorderBottom ? 'border-b-[1px] border-b-grey-750' : ''}`}
      >
        <div id="topBar-nav" className="flex justify-between items-center">
          <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
            <div className="flex items-center gap-[10px]">
              <span className="p-2 rounded-full bg-[#E2E3E5]">
                <ChartIcon width={20} height={20} />
              </span>
              <div>{topbarTitle}</div>
            </div>
          </div>

          <Button
            paddingStyles="p-0 m-0"
            className="lg:hidden relative flex items-center justify-start z-10 w-auto focus:outline-none"
            onClick={handleDrawer}
            variant="text"
          >
            <span className="p-2">
              <MenuBarIcon />
            </span>
          </Button>
        </div>
      </nav>
      {showSearch && (
        <div className="lg:hidden flex flex-col md:flex-row justify-between py-2 gap-3 items-center w-full">
          <div className="font-medium flex items-center justify-start w-full text-2xl text-neutral-light-800">
            <div className="flex items-center gap-[10px]">
              <span className="p-2 rounded-full bg-[#E2E3E5]">
                <ChartIcon width={20} height={20} />
              </span>
              <div>{topbarTitle}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PageTopBar.propTypes = {
  showSearch: PropTypes.bool,
  topbarTitle: PropTypes.string,
  noBorderBottom: PropTypes.bool,
};

export default React.memo(PageTopBar);
