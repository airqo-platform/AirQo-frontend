import React from 'react';
import { Link } from 'react-router-dom';

const ContactCard = ({ preamble, title, page_link, icon }) => {
  return (
    <Link to={`${page_link}`}>
      <div className="contact-card">
        <div>{icon}</div>
        <div>
          <p>
            {preamble}
            <br />
            <b>{title}</b>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;
