import React from 'react';
import NotificationBanner from 'src/components/NotificationBanner';
import LanguageSwitcher from 'src/components/LanguageSwitcher';
import Footer from 'src/components/Footer';
import TopBar from 'src/components/nav/TopBar';
import NewsletterSection from 'src/components/NewsletterSection/NewsletterSection';
import GetInvolvedModal from 'src/components/GetInvolvedModal';
import MiniHighlights from '../components/MiniHighlights';

const Page = ({ children }) => {
  return (
    <div className="Page">
      {/* <NotificationBanner /> */}
      <LanguageSwitcher />
      <TopBar />
      <div className="page-wrapper">{children}</div>
      <MiniHighlights />
      <NewsletterSection />
      <Footer />
      <GetInvolvedModal />
    </div>
  );
};

export default Page;
