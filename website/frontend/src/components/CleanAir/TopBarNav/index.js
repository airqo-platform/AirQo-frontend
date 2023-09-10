import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CloseIcon from 'assets/svg/Close.svg';
import MenuIcon from 'assets/svg/Menu.svg';
import AirQo from 'icons/nav/AirQo';
import NavTab from '../../nav/NavTab';

const TopBarNav = () => {
  const dispatch = useDispatch();

  const toggleMenu = () => {
    setOpenItem(null);
    document.getElementById('menu').classList.toggle('toggle_menu_btn');
    document.getElementById('close-menu').classList.toggle('toggle_close_menu_btn');
    document.getElementById('nav-center').classList.toggle('toggle_nav_center');
    document.getElementById('nav-right').classList.toggle('toggle_nav_right');
  };

  const toggleCloseMenu = () => {
    setOpenItem(null);
    document.getElementById('close-menu').classList.remove('toggle_close_menu_btn');
    document.getElementById('menu').classList.remove('toggle_menu_btn');
    document.getElementById('nav-center').classList.remove('toggle_nav_center');
    document.getElementById('nav-right').classList.remove('toggle_nav_right');
  };

  const [openItem, setOpenItem] = useState(null);

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (item) => {
    if (width < 1024) {
      setOpenItem(openItem === item ? null : item);
    } else {
      return;
    }
  };
  return (
    <div className="TopBar">
      <div className="wrapper">
        <div className="logo">
          <Link to="/">
            <AirQo />
          </Link>
        </div>
        <div className="nav-center" id="nav-center">
          <div className="nav-dropdown-item">
            <NavTab text="Solutions" onClick={() => handleClick('Solutions')} />
            <div className="dropdown" id={openItem === 'Solutions' ? 'solutions-dropdown' : ''}>
              <h3 className="title">Solutions</h3>
              <div className="dropdown-list">
                <div className="dropdown-list-item">
                  <Link to="#" style={{ textDecoration: 'none' }}>
                    <h3>N/A</h3>
                    <h4>N/A</h4>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="#" style={{ textDecoration: 'none' }}>
                    <h3>N/A</h3>
                    <h4>N/A</h4>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="#" style={{ textDecoration: 'none' }}>
                    <h3>N/A</h3>
                    <h4>N/A</h4>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-dropdown-item single-links">
            <NavTab text="About" path="#" hideArrow />
          </div>
          <NavTab text="Get involved" hideArrow colored path="#" />
          <NavTab text="Explore data" path="#" hideArrow filled />
        </div>
      </div>
      <MenuIcon className="menu-btn" id="menu" onClick={toggleMenu} />
      <CloseIcon className="close-menu-btn" id="close-menu" onClick={toggleCloseMenu} />
    </div>
  );
};

export default TopBarNav;
