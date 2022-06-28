import React from 'react'
import { Link } from 'react-router-dom';

const ContactCard = ({ preamble, title, page_link, icon }) => {
  return (
    <div className='contact-card'>
      <div>{icon}</div>
      <div>
        <p>
          {preamble}
          <br />
          <Link to={`${page_link}`}><b>{title}</b></Link>
        </p>
      </div>
    </div>
  )
}

export default ContactCard;