import React from 'react';
import { AccessTimeOutlined, CalendarMonth } from '@mui/icons-material';

const EventsHeader = ({title, subText, category, startDate, endDate, startTime, endTime, detailsLink, registerLink}) => {
  return (
    <div className="page-header">
      <div className="content">
        <div className="title-wrapper">
          <h2 className="event-title">{title}</h2>
          <span className="sub-text">{subText}</span>
          {
            //   If category is events, show. Should different between blog and event
            <>
              <div>
                <span>
                  <CalendarMonth /> <span>16th - 18th November 2022</span>{' '}
                </span>
                <span>
                  <AccessTimeOutlined /> <span> 8:00am - 5:00pm</span>{' '}
                </span>
              </div>
              <div>
                <button className="a-link">Read more</button>
                <button className="a-link">Register</button>
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default EventsHeader;
