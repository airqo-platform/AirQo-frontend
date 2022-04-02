import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import Footer from 'src/components/Footer';
import TopBar from 'src/components/nav/TopBar';

const Page = ({ children }) => (
        <div className="Page">
            <NotificationBanner />
            <TopBar />
            {children}
            <Footer />
        </div>
);

export default Page;
