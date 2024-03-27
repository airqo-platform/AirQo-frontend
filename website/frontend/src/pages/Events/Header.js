import React from 'react';
import { AccessTimeOutlined, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EventsHeader = ({
  title,
  subText,
  show,
  startDate,
  endDate,
  startTime,
  endTime,
  detailsLink,
  registerLink,
  eventImage
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const NstartDate = new Date(startDate);
  const NendDate = new Date(endDate);

  const sameMonth = NstartDate.getMonth() === NendDate.getMonth();
  const startDateStr = format(NstartDate, sameMonth ? 'do' : 'do MMMM');
  const endDateStr = format(NendDate, 'do MMMM yyyy');

  const timeDisplay = endTime
    ? `${startTime.slice(0, -3)} - ${endTime.slice(0, -3)}`
    : t('about.events.header.time.text');

  return (
    <div className="page-header">
      <div className="content">
        <div className="title-wrapper">
          {show ? (
            <>
              <div className="feature">
                <h2 className="event-title">{title}</h2>
                <span className="sub-text">{subText}</span>
                <div className="time">
                  <span className="item">
                    <CalendarMonth />
                    <span>
                      {endDate
                        ? `${startDateStr} - ${endDateStr}`
                        : format(NstartDate, 'do MMMM yyyy')}
                    </span>
                  </span>
                  <span className="item">
                    <AccessTimeOutlined />
                    <span>{timeDisplay}</span>
                  </span>
                </div>
                <div className="links">
                  <button className="link" onClick={() => navigate(`/events/${detailsLink}/`)}>
                    {t('about.events.header.buttons.btn1.text')}
                  </button>
                  {registerLink && (
                    <a href={registerLink} target="_blank" rel="noopener noreferrer">
                      <button className="link">{t('about.events.header.buttons.btn2.text')}</button>
                    </a>
                  )}
                </div>
              </div>
              <div className="feature-image">
                <img src={eventImage} alt="" loading="lazy" />
              </div>
            </>
          ) : (
            <div>
              <h2>{t('about.events.header.title')}</h2>
              <p className="sub-title">{t('about.events.header.subText')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsHeader;
