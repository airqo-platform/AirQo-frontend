import React, { useEffect } from 'react';
import AirQo from 'icons/nav/AirQo';
import NavTab from './NavTab';
import MenuIcon from 'assets/svg/Menu.svg';
import CloseIcon from 'assets/svg/Close.svg';
import { Link } from 'react-router-dom';

const TopBar = () => {

    const toggleDropdown = (dropdownId) => () => {
        // var dropdownElems = document.getElementsByClassName("dropdown");

        // for(let i=0; i<dropdownElems.length; i++){
        //     if(dropdownElems[i] != document.getElementById(dropdownId)){
        //         dropdownElems[i].classList.remove("toggle_dropdown");
        //     }
        // }

        // document.getElementById(dropdownId).classList.toggle("toggle_dropdown");
    }

    const toggleMenu = () => {
        document.getElementById("menu").classList.toggle("toggle_menu_btn");
        document.getElementById("close-menu").classList.toggle("toggle_close_menu_btn");
        document.getElementById("nav-center").classList.toggle("toggle_nav_center");
        document.getElementById("nav-right").classList.toggle("toggle_nav_right");    
    }

    const toggleCloseMenu = () => {
        document.getElementById("close-menu").classList.remove("toggle_close_menu_btn");
        document.getElementById("menu").classList.remove("toggle_menu_btn");
        document.getElementById("nav-center").classList.remove("toggle_nav_center");
        document.getElementById("nav-right").classList.remove("toggle_nav_right"); 
    }

    return(
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
                                    <Link to="/solutions/african-cities/uganda" style={{textDecoration:"none"}}>
                                        <h3>For African Cities</h3>
                                        <h4>Air quality analytics for city councils</h4>
                                    </Link>
                                    
                                </div>
                                <div className="dropdown-list-item">
                                    <Link to="/solutions/communities" style={{textDecoration:"none"}}>
                                        <h3>For Communities</h3>
                                        <h4>Recruiting locals to drive awareness</h4>
                                    </Link>
                                </div>
                                <div className="dropdown-list-item">
                                    <Link to="/solutions/research" style={{textDecoration:"none"}}>
                                        <h3>For Research</h3>
                                        <h4>Free access to air quality analytics</h4>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <NavTab text="About" path="/about-us" hideArrow />
                    <NavTab text="Get involved" path="/get-involved" hideArrow colored />
                    <NavTab text="Explore data"  hideArrow filled />
                </div>
                {/* <div className="nav-right" id="nav-right">
                    <NavTab text="Sign In"  hideArrow colored />
                    
                </div> */}
            </div>
            <MenuIcon className="menu-btn" id="menu" onClick={toggleMenu} />
            <CloseIcon className="close-menu-btn" id="close-menu" onClick={toggleCloseMenu} />
        </div>
    )
};

export default TopBar;
