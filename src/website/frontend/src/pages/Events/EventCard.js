import { CalendarMonth } from '@mui/icons-material';
import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EventCard = ({ image, title, subText, startDate, endDate, link, key, web_category }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routeToDetails = (link) => (event) => {
    event.preventDefault();
    if (web_category === 'cleanair') navigate(`/clean-air/event-details/${link}/`);
    else navigate(`/events/${link}/`);
  };

  const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  };

  const startDateDifference = days(new Date(), new Date(startDate));
  const endDateDifference = days(new Date(endDate), new Date());

  return (
    <div className="card" key={key}>
      <img src={image} alt={title} height={250} width={300} />
      <div>
        <h1>{title}</h1>
        <h5>{subText}</h5>
        <div className="duration">
          <CalendarMonth />
          <span>{format(new Date(startDate), 'do MMMM, yyyy')}</span>
        </div>
        {/* <div className="badge">
          {startDateDifference === 0 || endDateDifference === 1 ? (
            <div className="today">Happening today</div>
          ) : (
            <span />
          )}
        </div> */}
        <div className="cta">
          <button className="link" onClick={routeToDetails(link)}>
            {t('about.events.eventCard.cta.text')} {'-->'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
