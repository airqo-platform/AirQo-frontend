import React from 'react';
import PlaceholderImg from 'assets/img/Events/events-placeholder.png';
import Page from '../Page';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';

const EventDetails = () => {
  return (
    <Page>
      <div>
        <div style={{ height: '450px', padding: '80px 20px 0 20px', backgroundImage: `url(${PlaceholderImg})`}}>
          <span>Events</span>
          <span>{'>'}</span>
          <span>AirQo Conference</span>
          <div>
            <h1>AirQo Conference</h1>
            <h5>Join Us and our Partners as we discuss the future of Air Quality Management</h5>
          </div>
        </div>
        <div>
          <div>
            <h3>Event Details</h3>
            <span>
              <CalendarMonth />
              <span>20th April 2023</span>
            </span>
            <div>
              <AccessTimeOutlined />
              <span>8:00am-5:00pm</span>
            </div>
            {/* Google maps location link */}
            <div>
              <PlaceOutlined />
              <a href="#">
                <span>Makerere University</span>
              </a>
              <button>Register</button>
            </div>
          </div>
          <div className='body'></div>
        </div>
      </div>
    </Page>
  );
};

export default EventDetails;
