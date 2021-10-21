import React from 'react';
import AirQo from 'icons/nav/AirQo';
import NavTab from './NavTab';

const TopBar = () => (
        <div className="TopBar">
            <AirQo />
            <div className="container">
                <NavTab text="Solutions" width={135} />
                <NavTab text="Products" width={133} />
                <NavTab text="About us" width={133} />
                <NavTab text="Resources" width={145} />
                <NavTab text="Blog" width={82} hideArrow />
            </div>
            <NavTab text="Get involved" width={160} hideArrow colored />
            <NavTab text="Get the App" width={156} hideArrow filled />
        </div>
);

export default TopBar;
