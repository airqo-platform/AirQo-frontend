import React from 'react';
import AirQo from 'icons/nav/AirQo';
import NavTab from './NavTab';
import MenuIcon from '@mui/icons-material/Menu';

const TopBar = () => {
    return(
        <div className="TopBar">
            <AirQo className="brand-logo"/>
            <div className="container">
                <NavTab className="NavTab__menuItem" text="Solutions" width={135} />
                <NavTab className="NavTab__menuItem" text="Our work" width={133} />
                <NavTab className="NavTab__menuItem" text="About" width={133} />
                <NavTab className="NavTab__menuItem" text="Get involved" width={145} hideArrow />
            </div>
            <NavTab className="NavTab__menuItem" text="Sign In" width={160} hideArrow colored />
            <NavTab className="NavTab__menuItem" text="Request a demo" width={167} hideArrow filled />
            <MenuIcon className="menu-btn" />
        </div>
    )
};

export default TopBar;
