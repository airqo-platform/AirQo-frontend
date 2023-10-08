import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadPressData } from '../../../../reduxStore/Press/PressSlice';
import { getAllEvents } from '../../../../reduxStore/Events/EventSlice';
import { isEmpty } from 'underscore';
import { Link } from 'react-router-dom';
import NewArticle from './NewArticle';

const Highlight = () => {
  const dispatch = useDispatch();
  const pressData = useSelector((state) => state.pressData.pressData);
  const eventsData = useSelector((state) => state.eventsData.events);

  useEffect(() => {
    try {
      if (isEmpty(pressData)) {
        dispatch(loadPressData());
      }
      if (isEmpty(eventsData)) {
        dispatch(getAllEvents());
      }
    } catch (err) {
      console.log('Error in loading data', err);
    }
  }, [dispatch, pressData, eventsData]);

  // Getting the latest news
  const latestNews = pressData.filter((news) => news.website_category === 'cleanair');
  const latestNewsItem = latestNews.length > 0 ? latestNews[0] : null;

  // Getting the two latest events
  const latestEvents = eventsData
    .filter((event) => event.website_category === 'cleanair')
    .slice(0, 2);

  if (!latestNewsItem && latestEvents.length === 0) {
    return null;
  }

  return (
    <div className="CleanAir-highlights">
      <div
        className="highlights-wrapper"
        style={{
          display: latestNewsItem && latestEvents.length > 0 ? '' : 'flex'
        }}>
        {latestNewsItem && (
          <div className="news-section">
            <div className="pill-con">
              <span id="first-pill">
                <p>Latest News</p>
              </span>
            </div>
            <div className="news-container">
              <NewArticle
                key={0}
                icon={latestNewsItem.publisher_logo}
                date={latestNewsItem.date_published}
                title={latestNewsItem.article_title}
                url={latestNewsItem.article_link}
              />
            </div>
          </div>
        )}
        {latestEvents.length > 0 && (
          <div className="events-section">
            <div className="pill-con">
              <span id="first-pill">
                <p>Latest Events</p>
              </span>
            </div>
            <div
              className="event-wrapper"
              style={{
                display: latestNewsItem && latestEvents.length > 0 ? '' : 'flex'
              }}>
              {latestEvents.map((event, index) => (
                <div key={index} className="event-container">
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
        )}
      </div>
    </div>
  );
};

export default Highlight;
