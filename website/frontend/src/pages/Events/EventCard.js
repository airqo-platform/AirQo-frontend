import { CalendarTodayOutlined } from '@mui/icons-material';
import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ image, title, subText, startDate, endDate, link, key }) => {
  const navigate = useNavigate();
  const routeToDetails = (link) => (event) => {
    event.preventDefault();
    navigate(`/events/${link}/`);
  };
  return (
    <div className="card" key={key}>
      <img src={image} alt={title} height={250} width={300} />
      <div>
        <h1>{title}</h1>
        <h5>{subText}</h5>
        <div className="duration">
          <CalendarTodayOutlined />
          <span>{format(new Date(startDate), 'do MMMM, yyyy')}</span>
        </div>
        <div className="badge">
          {new Date(startDate).getTime() === new Date().getTime() ||
            (new Date(endDate).getTime() === new Date().getTime() && (
              <div className="today">Happening today</div>
            ))}
        </div>
        <div className="cta">
          <button className="link" onClick={routeToDetails(link)}>
            Read More {'-->'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
