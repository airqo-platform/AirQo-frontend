import React from 'react';
import { AccessTimeOutlined, CalendarMonth } from '@mui/icons-material';
import BannerImg from 'assets/img/Events/banner.png';
import {format} from 'date-fns'

const EventsHeader = ({
  title,
  subText,
  category,
  startDate,
  endDate,
  startTime,
  endTime,
  detailsLink,
  registerLink
}) => {
  return (
    <div className="page-header">
      <div className="content">
        <div className="title-wrapper">
          <div className="feature">
            <h2 className="event-title">{title}</h2>
            <span className="sub-text">{subText}</span>
            {
              //   If category is events, show. Should different between blog and event
              <>
                <div className="time">
                  <span className="item">
                    <CalendarMonth /> <span>{format(new Date(startDate), 'do')} - {format(new Date(endDate),'do MMMM yyyy')}</span>{' '}
                  </span>
                  <span className="item">
                    <AccessTimeOutlined /> <span> {startTime} - {endTime}</span>{' '}
                  </span>
                </div>
                <div className="links">
                  <a href={`${detailsLink}`}>
                    <button className="link">Read more</button>
                  </a>
                  <a href={`${registerLink}`} target="_blank" rel="noopener noreferrer">
                    <button className="link">Register</button>
                  </a>
                </div>
              </>
            }
          </div>
          <div className="feature-image">
            <img src={BannerImg} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsHeader;
