import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllEvents } from '../../../../reduxStore/Events/EventSlice';
import { isEmpty } from 'underscore';
import { Link } from 'react-router-dom';
import { AccessTimeOutlined, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';

const Highlight = () => {
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

  if (latestEvents.length === 0) {
    return null;
  }

  return (
    <div className="CleanAir-highlights">
      <div className="highlights-wrapper">
        {latestEvents.length > 0 ? (
          <div className="events-section">
            <div className="pill-con">
              <span id="first-pill">
                <p>Featured Event</p>
              </span>
            </div>
            <div className="event-wrapper">
              {latestEvents.map((event, index) => (
                <div key={index} className="event-container">
                  <img src={event.event_image} alt={event.unique_title} />
                  <div className="event-content">
                    <h1>{event.title}</h1>
                    <p>{event.title_subtext}</p>
                    <div className="time">
                      <span className="item">
                        <CalendarMonth />
                        {event.end_date !== null ? (
                          <span>
                            {format(new Date(event.start_date), 'do')} -{' '}
                            {format(new Date(event.end_date), 'do MMMM yyyy')}
                          </span>
                        ) : (
                          <span>{format(new Date(event.start_date), 'do MMMM yyyy')}</span>
                        )}
                      </span>
                      <span className="item">
                        <AccessTimeOutlined />
                        {event.end_time !== null ? (
                          <span>
                            {event.start_time.slice(0, -3)} - {event.end_time.slice(0, -3)}
                          </span>
                        ) : (
                          <span>All Day</span>
                        )}
                      </span>
                    </div>
                    {/* time */}
                    <div className="event-btn">
                      <Link to={event.location_link} target="_blank">
                        <button>Read More {' -->'}</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
