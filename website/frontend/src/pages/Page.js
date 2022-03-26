import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import Footer from 'src/components/Footer';

const Page = ({ children }) => (
        <div className="Page">
            <NotificationBanner />
            {children}
            <Footer />
        </div>
);

export default Page;
