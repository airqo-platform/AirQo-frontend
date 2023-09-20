import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadPressData } from '../../../../reduxStore/Press/PressSlice';
import { getAllEvents } from '../../../../reduxStore/Events/EventSlice';
import { isEmpty } from 'underscore';
import { Link } from 'react-router-dom';
import Section6 from 'assets/img/cleanAir/section6.png';
import NewArticle from './NewArticle';

const Highlight = () => {
  const dispatch = useDispatch();
  const pressData = useSelector((state) => state.pressData.pressData);
  const eventsData = useSelector((state) => state.eventsData.events);

  useEffect(() => {
    if (isEmpty(pressData)) {
      dispatch(loadPressData());
    }
  }, []);

  useEffect(() => {
    if (isEmpty(eventsData)) {
      dispatch(getAllEvents());
    }
  }, []);

  // Getting the latest news
  const latestNews = pressData && pressData[0];

  // Getting the two latest events
  const latestEvents = eventsData.slice(0, 2);

  return (
    <div className="CleanAir-highlights">
      <div className="highlights-wrapper">
        <div className="news-section">
          <div className="pill-con">
            <span id="first-pill">
              <p>Latest News</p>
            </span>
          </div>
          <div className="news-container">
            {latestNews && (
              <NewArticle
                key={0}
                icon={latestNews.publisher_logo}
                date={latestNews.date_published}
                title={latestNews.article_title}
                url={latestNews.article_link}
              />
            )}
          </div>
        </div>
        <div className="events-section">
          <div className="pill-con">
            <span id="first-pill">
              <p>Latest Events</p>
            </span>
          </div>
          {latestEvents.map((event, index) => (
            <div
              key={index}
              className="event-container"
              style={{ marginTop: index > 0 ? '25px' : '0' }}>
              <img src={event.event_image} alt={event.unique_title} />
              <div className="event-content">
                <h1>{event.title}</h1>
                <p>{event.title_subtext}</p>
                <div className="event-btn">
                  {event.registration_link ? (
                    <Link to={event.registration_link} target="_blank">
                      <span>Register here {'-->'}</span>
                    </Link>
                  ) : (
                    <Link to={'/events/' + event.unique_title}>
                      <span>Event Details {'-->'}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Highlight;
