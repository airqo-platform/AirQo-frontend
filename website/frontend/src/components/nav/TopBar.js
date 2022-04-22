import React from 'react';
import AirQo from 'icons/nav/AirQo';
import NavTab from './NavTab';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const TopBar = () => {
    return(
        <div className="TopBar">
            <div className="wrapper">
                <Link to="/"><AirQo /></Link>
                <div className="nav-center">
                    <NavTab className="NavTab__menuItem" text="Solutions" />
                    <NavTab className="NavTab__menuItem" text="Our work" />
                    <NavTab className="NavTab__menuItem" text="About" path="/about-us" hideArrow />
                    <NavTab className="NavTab__menuItem" text="Get involved" path="/get-involved" hideArrow />
                </div>
                <div className="nav-right">
                    <NavTab className="NavTab__menuItem" text="Sign In"  hideArrow colored />
                    <NavTab className="NavTab__menuItem" text="Request a demo"  hideArrow filled />
                </div>
                
                <MenuIcon className="menu-btn" />
            </div>
        </div>
    )
};

export default TopBar;
