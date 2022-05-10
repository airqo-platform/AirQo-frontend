import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import Footer from 'src/components/Footer';
import TopBar from 'src/components/nav/TopBar';
import NewsletterSection from "src/components/NewsletterSection/NewsletterSection";

const Page = ({ children }) => (
        <div className="Page">
            {/* <NotificationBanner /> */}
            <TopBar />
            {children}
            <NewsletterSection />
            <Footer />
        </div>
);

export default Page;
