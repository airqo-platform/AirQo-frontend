import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllEvents } from 'reduxStore/Events';
import { isEmpty } from 'underscore';
import { useNavigate } from 'react-router-dom';
import { AccessTimeOutlined, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import Spinner from '../loaders/Spinner';
import { useTranslation, Trans } from 'react-i18next';

/**
 * @description Highlight component for the CleanAir site
 * @returns {JSX.Element}
 */
const Highlight = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const eventsData = useSelector((state) => state.eventsData.events);

  useEffect(() => {
    if (isEmpty(eventsData)) {
      dispatch(getAllEvents());
    }
  }, [eventsData]);

  // Getting the two latest events
  const latestEvents =
    eventsData.length > 0
      ? eventsData.filter(
          (event) => event.website_category === 'cleanair' && event.event_tag === 'featured'
        )
      : [];

  const featuredEvent = latestEvents[0];

  if (latestEvents.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '50px 0'
        }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="CleanAir-highlights">
      <div className="highlights-wrapper">
        {latestEvents.length > 0 ? (
          <div className="events-section">
            <div className="pill-con">
              <span id="first-pill">
                <p>{t('cleanAirSite.about.highlightSection.tag')}</p>
              </span>
            </div>
            <div className="event-wrapper">
              <div className="event-container">
                <img
                  src={featuredEvent.event_image}
                  alt={featuredEvent.unique_title}
                  loading="lazy"
                />
                <div className="event-content">
                  <h1>{featuredEvent.title}</h1>
                  <p>{featuredEvent.title_subtext}</p>
                  <div className="time">
                    <span className="item">
                      <CalendarMonth />
                      {featuredEvent.end_date !== null ? (
                        <span>
                          {format(new Date(featuredEvent.start_date), 'do MMM')} -{' '}
                          {format(new Date(featuredEvent.end_date), 'do MMMM yyyy')}
                        </span>
                      ) : (
                        <span>{format(new Date(featuredEvent.start_date), 'do MMMM yyyy')}</span>
                      )}
                    </span>
                    <span className="item">
                      <AccessTimeOutlined />
                      {featuredEvent.end_time !== null ? (
                        <span>
                          {featuredEvent.start_time.slice(0, -3)} -{' '}
                          {featuredEvent.end_time.slice(0, -3)}
                        </span>
                      ) : (
                        <span>{t('cleanAirSite.about.highlightSection.tag2')}</span>
                      )}
                    </span>
                  </div>
                  {/* time */}
                  <div className="event-btn">
                    <div>
                      <button
                        type="button"
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          navigate(`/clean-air/event-details/${featuredEvent.unique_title}/`)
                        }>
                        {t('cleanAirSite.about.highlightSection.cta')} {' -->'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

export default Highlight;
