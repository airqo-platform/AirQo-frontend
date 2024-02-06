import React from 'react';
import { AccessTimeOutlined, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

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
  const routeToDetails = (link) => (event) => {
    event.preventDefault();
    navigate(`/events/${link}/`);
  };
  return (
    <div className="page-header">
      <div className="content">
        <div className="title-wrapper">
          {show ? (
            <>
              <div className="feature">
                <h2 className="event-title">{title}</h2>
                <span className="sub-text">{subText}</span>
                {
                  //   If category is events, show. Should different between blog and event
                  <>
                    <div className="time">
                      <span className="item">
                        <CalendarMonth />
                        {endDate !== null ? (
                          <span>
                            {format(new Date(startDate), 'do')} -{' '}
                            {format(new Date(endDate), 'do MMMM yyyy')}
                          </span>
                        ) : (
                          <span>{format(new Date(startDate), 'do MMMM yyyy')}</span>
                        )}
                      </span>
                      <span className="item">
                        <AccessTimeOutlined />
                        {endTime !== null ? (
                          <span>
                            {startTime.slice(0, -3)} - {endTime.slice(0, -3)}
                          </span>
                        ) : (
                          <span>{t('about.events.header.time.text')}</span>
                        )}
                      </span>
                    </div>
                    <div className="links">
                      <button className="link" onClick={routeToDetails(detailsLink)}>
                        {t('about.events.header.buttons.btn1.text')}
                      </button>
                      {registerLink ? (
                        <a href={`${registerLink}`} target="_blank" rel="noopener noreferrer">
                          <button className="link">
                            {t('about.events.header.buttons.btn2.text')}
                          </button>
                        </a>
                      ) : (
                        <span></span>
                      )}
                    </div>
                  </>
                }
              </div>
              <div className="feature-image">
                <img src={eventImage} alt="" />
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
