import { CalendarTodayOutlined } from '@mui/icons-material'
import React from 'react'
import { format } from 'date-fns';

const EventCard = ({image, title, subText, startDate, link}) => {
  return (
    <div className="card">
      <img src={image} alt={title} height={250} width={300} />
      <div>
        <h1>{title}</h1>
        <h5>{subText}</h5>
        <div className="duration">
          <CalendarTodayOutlined />
          <span>{format(new Date(startDate), 'do MMMM, yyyy')}</span>
        </div>
        <div className="cta">
          <a className="link" href={link}>
            Read More {'-->'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default EventCard