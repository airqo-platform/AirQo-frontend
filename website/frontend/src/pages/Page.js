import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import { TopBar } from 'src/components/nav';
import Footer from 'src/components/Footer';

const Page = ({ children }) => (
        <div className="Page">
            <NotificationBanner />
            <TopBar />
            {children}
            <Footer />
        </div>
);

export default Page;
