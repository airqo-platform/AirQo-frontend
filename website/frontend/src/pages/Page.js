import React from 'react';
import Footer from 'src/components/Footer';
import TopBar from 'src/components/nav/TopBar';
import NewsletterSection from "src/components/NewsletterSection/NewsletterSection";

const Page = ({ children }) => (
        <div className="Page">
            <TopBar />
            {children}
            <NewsletterSection />
            <Footer />
        </div>
);

export default Page;
