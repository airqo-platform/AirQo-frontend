import React from 'react';
import Cancel from 'icons/nav/Cancel';

const NotificationBanner = () => (
        <div className="NotificationBanner">
            <div className="wrapper">
                <span className="first">Air Quality monitoring in your home. coming soon!</span>
                <span className="second">Join the waiting list</span>
            </div>
            <Cancel />
        </div>
);

export default NotificationBanner;
