import React from 'react';
import PropTypes from 'prop-types';
import NotificationBanner from '../components/NotificationBanner';
import Footer from '../components/Footer';
import BackedBy from '../components/backedBy';

const Page = ({ children }) => (
        <div className="Page">
            <NotificationBanner />
            {children}
            <BackedBy />
            <Footer />
        </div>
);

export default Page;

Page.propTypes = {
  children: PropTypes.element.isRequired,
};
