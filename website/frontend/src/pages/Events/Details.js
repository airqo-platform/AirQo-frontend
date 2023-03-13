import React from 'react';
import PlaceholderImg from 'assets/img/Events/event-placeholder.jpg';
import Page from '../Page';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';
import ParticipatingCities from 'assets/img/Events/participation.png';
import Programme1 from 'assets/img/Events/programme-1.png';
import Programme2 from 'assets/img/Events/programme-2.png';

const EventDetails = () => {
  return (
    <Page>
      <div className="events details">
        <div
          className="detail-header"
          style={{
            padding: '80px 20px',
            backgroundImage: `url(${PlaceholderImg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="content">
            <div className="breadcrumb">
              <span style={{ textDecoration: 'underline' }}>
                <a href='/events'>Events</a></span>
              <span style={{ fontFamily: 'monospace' }}>{'>'}</span>
              <span style={{ color: '#A8B2C7' }}>
                Championing Liveable urban Environments through African Networks for Air (CLEAN AIR)
              </span>
            </div>
            <div>
              <h1>
                Championing Liveable urban Environments through African Networks for Air (CLEAN AIR)
              </h1>
              <h5>Extended workshop and launchpad for regional collaborations</h5>
            </div>
          </div>
        </div>
        <div className="detail-body">
          <div className="event-details">
            <div className="time">
              <h3>Event Details</h3>
              <span className="item">
                <CalendarMonth />
                <span>20th April 2023</span>
              </span>
              <div className="item">
                <AccessTimeOutlined />
                <span>8:00am - 5:00pm</span>
              </div>
              {/* Google maps location link */}
              <div className="item">
                <PlaceOutlined />
                <a>
                  <span>Kampala, Uganda</span>
                </a>
              </div>
            </div>
            <div className="register">
              <a
                href={
                  'https://docs.google.com/forms/d/e/1FAIpQLSfm4d8isDZPfpUb9xHbWB9oVOcjyUzXXaVWXiH8c9X482KxDQ/viewform'
                }
                target="_blank"
                rel="noopener noreferrer">
                <button>Register</button>
              </a>
            </div>
          </div>
          <div className="body">
            <p>
              We are happy to host a 3-day peer learning and knowledge exchange workshop that will
              bring together the communities of practice from over 15 cities in Africa, with a focus
              on utilising low-cost sensors for air quality management in Africa.{' '}
            </p>
            <p>
              Held under the theme:{' '}
              <b>Championing Liveable Urban Environments through African Networks for Air</b> , the
              workshop serves as a launchpad for Africa-led collaborations and multi-regional
              partnerships for sustained interventions to achieve cleaner air across the continent.
            </p>
            <p>
              <b>The 3-day engagement aims to achieve the following objectives:</b>
              <ol>
                <li>
                  Increase the understanding of low-cost air quality sensor networks and digital
                  solutions as new approaches for air quality management in the African context.
                </li>
                <li>Foster city-city and policy-research collaborations.</li>
                <li>
                  Increase awareness of contextual issues of air quality for better health outcomes.
                </li>
              </ol>
            </p>
            <i>This is largely an in-person event with selected hybrid sessions.</i>
            <p>
              Confirm your attendance by filling in{' '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfm4d8isDZPfpUb9xHbWB9oVOcjyUzXXaVWXiH8c9X482KxDQ/viewform"
                target="_blank"
                rel="noopener noreferrer">
                this form
              </a>
            </p>
            <br />
            <b>Participating cities:</b>
            <div>
              <img src={ParticipatingCities} alt="" />
            </div>
            <br />
            <b>Proposed Programme:</b>
            <div>
              <img src={Programme1} alt="" />
            </div>
            <div>
              <img src={Programme2} alt="" />
            </div>
            <p>
              For any questions and clarifications, please feel free to directly contact the below
              persons accordingly:
            </p>
            <ol>
              <li>
                <b>About the Programme and general inquiries</b> - Deo Okure, Air Quality Scientist and
                Programmes Manager, AirQo by email on <a>dokure@airqo.net</a>
              </li>
              <li>
                <b>Logistics and travel arrangements</b> - Dora Bampangana, Project Administrator -
                <a> dora@airqo.net</a>
              </li>
              <li><b>Communications and Visibility</b> - Maclina Birungi, Marketing and Communications Lead - <a>maclina@airqo.net</a></li>
            </ol>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default EventDetails;
