import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import TopBar from 'src/components/nav/TopBar';

const PageMini = ({ children }) => {
    return (
        <div className='Page-mini'>
            {/* <NotificationBanner /> */}
            <TopBar />
            <div className='page-mini-wrapper'>
                {children}
            </div>
        </div>
    )
}

export default PageMini;