import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import TopBar from 'src/components/nav/TopBar';

const PageMini = ({ children }) => {
    return (
        <div className='Page-mini'>
            {/* <NotificationBanner /> */}
            <TopBar />
            {children}
        </div>
    )
}

export default PageMini;