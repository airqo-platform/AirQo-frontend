import React from 'react';
import { Link } from 'react-router-dom';
import Section6 from 'assets/img/cleanAir/section6.png';
import NewArticle from './NewArticle';

const Highlight = () => {
  const newsData = [
    {
      icon: null,
      date: 'May 1, 2021',
      title: 'How we’re measuring air quality in Kampala - and why it works for African cities',
      url: '#'
    },
    {
      icon: null,
      date: 'June 1, 2020',
      title: 'How we’re measuring air quality in Kampala - and why it works for African cities',
      url: '#'
    }
  ];

  const eventData = [
    {
      image: Section6,
      altText: 'Event Image',
      title: 'Community awareness and engagements',
      description:
        'Empowering communities across Africa with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions.',
      link: '#',
      buttonText: 'Register here'
    },
    {
      image: Section6,
      altText: 'Event Image',
      title: 'Community ',
      description:
        'Empowering communities across Africa with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions.',
      link: '#',
      buttonText: 'Event Details'
    }
  ];

  // Get the latest news
  const latestNews = newsData[0];

  // Get the two latest events
  const latestEvents = eventData.slice(0, 2);

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
            <NewArticle
              icon={latestNews.icon}
              date={latestNews.date}
              title={latestNews.title}
              url={latestNews.url}
            />
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
              <img src={event.image} alt={event.altText} />
              <div className="event-content">
                <h1>{event.title}</h1>
                <p>{event.description}</p>
                <div className="event-btn">
                  <Link to={event.link} target="_blank">
                    <span>
                      {event.buttonText} {'-->'}
                    </span>
                  </Link>
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
