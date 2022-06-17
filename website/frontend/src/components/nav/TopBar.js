import React from 'react';
import { useDispatch } from 'react-redux';
import { showGetInvolvedModal } from 'reduxStore/GetInvolved/operations';
import AirQo from 'icons/nav/AirQo';
import MenuIcon from 'assets/svg/Menu.svg';
import CloseIcon from 'assets/svg/Close.svg';
import { Link } from 'react-router-dom';
import NavTab from './NavTab';

const TopBar = () => {
  const dispatch = useDispatch();
  const showModal = () => dispatch(showGetInvolvedModal(true));
  const toggleMenu = () => {
    document.getElementById('menu').classList.toggle('toggle_menu_btn');
    document.getElementById('close-menu').classList.toggle('toggle_close_menu_btn');
    document.getElementById('nav-center').classList.toggle('toggle_nav_center');
    document.getElementById('nav-right').classList.toggle('toggle_nav_right');
  };

  const toggleCloseMenu = () => {
    document.getElementById('close-menu').classList.remove('toggle_close_menu_btn');
    document.getElementById('menu').classList.remove('toggle_menu_btn');
    document.getElementById('nav-center').classList.remove('toggle_nav_center');
    document.getElementById('nav-right').classList.remove('toggle_nav_right');
  };

  return (
        <div className="TopBar">
            <div className="wrapper">
                <div className="logo">
                    <Link to="/"><AirQo /></Link>
                </div>
                <div className="nav-center" id="nav-center">
                    <div className="nav-dropdown-item">
                        <NavTab
                          text="Solutions"
                        />
                        <div className="dropdown" id="african-cities-dropdown">
                            <h3 className="title">Solutions</h3>
                            <div className="dropdown-list">
                                <div className="dropdown-list-item">
                                    <Link to="/solutions/african-cities/uganda" style={{ textDecoration: 'none' }}>
                                        <h3>For African Cities</h3>
                                        <h4>Air quality analytics for city councils</h4>
                                    </Link>

                                </div>
                                <div className="dropdown-list-item">
                                    <Link to="/solutions/communities" style={{ textDecoration: 'none' }}>
                                        <h3>For Communities</h3>
                                        <h4>Recruiting locals to drive awareness</h4>
                                    </Link>
                                </div>
                                <div className="dropdown-list-item">
                                    <Link to="/solutions/research" style={{ textDecoration: 'none' }}>
                                        <h3>For Research</h3>
                                        <h4>Free access to air quality analytics</h4>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <NavTab text="About" path="/about-us" hideArrow />
                    <NavTab text="Get involved" hideArrow colored onClick={showModal} />
                    <NavTab text="Explore data" path="/explore-data" hideArrow filled />
                </div>

            </div>
            <MenuIcon className="menu-btn" id="menu" onClick={toggleMenu} />
            <CloseIcon className="close-menu-btn" id="close-menu" onClick={toggleCloseMenu} />
        </div>
  );
};

export default TopBar;
