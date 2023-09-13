import React from 'react';
import { Link } from 'react-router-dom';
import Section6 from 'assets/img/cleanAir/section6.png';
import NewArticle from './NewArticle';

const Highlight = () => {
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
              icon={null}
              date={'2021-03-01'}
              title={
                'How we’re measuring air quality in Kampala - and why it works for African cities'
              }
              url={'https://www.nilepost.co.ug/2021/03/01/clean-air-network-africa-cana-launch/'}
            />
          </div>
        </div>
        <div className="events-section">
          <div className="pill-con">
            <span id="first-pill">
              <p>Latest Events</p>
            </span>
          </div>
          <div className="event-container">
            <img src={Section6} alt={'Community awareness and engagements'} />
            <div className="event-content">
              <h1>Community awareness and engagements</h1>
              <p>
                Empowering communities across Africa with accurate, hyperlocal and timely air
                quality data to drive air pollution mitigation actions.
              </p>
              <div className="event-btn">
                <Link to="#" target="_blank">
                  <span>Register here {'-->'}</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="event-container" style={{ marginTop: '25px' }}>
            <img src={Section6} alt={'Community awareness and engagements'} />
            <div className="event-content">
              <h1>Community awareness and engagements</h1>
              <p>
                Empowering communities across Africa with accurate, hyperlocal and timely air
                quality data to drive air pollution mitigation actions.
              </p>
              <div className="event-btn">
                <Link to="#" target="_blank">
                  <span>Event Details {'-->'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Highlight;
