import { CalendarTodayOutlined } from '@mui/icons-material'
import React from 'react'

const EventCard = ({image, title, subText, startDate, link}) => {
  return (
    <div>
      <img src={image} alt={title} height={250} width={300}/>
      <div>
        <h1>{title}</h1>
        <h5>{subText}</h5>
        <div>
          <CalendarTodayOutlined />
          <span>{startDate}</span>
        </div>
        <span className="cta-link">
          <a className="link" href={link}>
            Read More {'-->'}
          </a>
        </span>
      </div>
    </div>
  );
}

export default EventCard