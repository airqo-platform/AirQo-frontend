import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';
import { useInitScrollTop } from 'utilities/customHooks';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { format } from 'date-fns';
import Loadspinner from '../../components/LoadSpinner';
import PageMini from '../PageMini';
import { useTranslation } from 'react-i18next';
import { getAllEvents } from 'reduxStore/Events';

const EventDetails = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { uniqueTitle } = useParams();

  const allEventsData = useSelector((state) => state.eventsData.events);
  const eventData = allEventsData.filter((event) => event.website_category === 'airqo');
  const eventDetails = eventData.filter((event) => event.unique_title === uniqueTitle) || {};
  const loading = useSelector((state) => state.eventsData.loading);

  const language = useSelector((state) => state.eventsNavTab.languageTab);

  useEffect(() => {
    if (isEmpty(allEventsData)) {
      dispatch(getAllEvents(language));
    }
  }, [dispatch, language]);

  return (
    <PageMini>
      {loading ? (
        <Loadspinner />
      ) : (
        <>
          {!isEmpty(eventData) &&
            eventDetails.map((event) => (
              <div className="events details" key={event.id}>
                <div
                  className="detail-header"
                  style={{
                    padding: '80px 20px',
                    background: `linear-gradient(0deg, rgba(15, 36, 83, 0.7), rgba(15, 36, 83, 0.7)),url(${event.background_image})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}>
                  <div className="content">
                    <div className="breadcrumb">
                      <span>
                        <Link to="/events">
                          {t('about.events.eventsDetails.header.breadCrumb')}
                        </Link>
                      </span>
                      <span style={{ fontFamily: 'monospace' }}>{'>'}</span>
                      <span style={{ color: '#A8B2C7' }}>{event.title}</span>
                    </div>
                    <div className="heading">
                      <h1>{event.title}</h1>
                      <h5>{event.title_subtext}</h5>
                    </div>
                  </div>
                </div>

                <div className="detail-body">
                  <div className="event-details">
                    <div className="time">
                      <h3>{t('about.events.eventsDetails.eventBody.time.title')}</h3>
                      <span className="item">
                        <CalendarMonth />
                        <span>
                          {event.end_date !== null ? (
                            <span>
                              {format(new Date(event.start_date), 'do')} -{' '}
                              {format(new Date(event.end_date), 'do MMMM yyyy')}
                            </span>
                          ) : (
                            <span>{format(new Date(event.start_date), 'do MMMM yyyy')}</span>
                          )}
                        </span>
                      </span>
                      <div className="item">
                        <AccessTimeOutlined />
                        <span>
                          {event.end_time !== null ? (
                            <span>
                              {event.start_time.slice(0, -3)} - {event.end_time.slice(0, -3)}
                            </span>
                          ) : (
                            <span>{t('about.events.eventsDetails.eventBody.time.time')}</span>
                          )}
                        </span>
                      </div>
                      {/* Google maps location link */}
                      {event.location_name ? (
                        <div className="item">
                          <PlaceOutlined />
                          <span>
                            <a href={event.location_link !== null ? event.location_link : null}>
                              <span>{event.location_name}</span>
                            </a>
                          </span>
                        </div>
                      ) : (
                        <span />
                      )}
                    </div>

                    {event.registration_link && (
                      <div className="register">
                        <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                          <button>
                            {t('about.events.eventsDetails.eventBody.register.btnText')}
                          </button>
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="body">
                    {event.partner.length > 0 ? (
                      <div className="partner_logos" id="logo-table">
                        <table>
                          <tbody>
                            <tr>
                              {event.partner.map((partner) => (
                                <td key={partner.id}>
                                  <img src={partner.partner_logo} alt={partner.name} />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span />
                    )}
                    <div dangerouslySetInnerHTML={{ __html: event.html }} className="html"></div>
                    {event.program.length > 0 ? (
                      <div className="program">
                        <h3>{t('about.events.eventsDetails.eventBody.program.title')}</h3>
                        {event.program.map((program) => (
                          <div key={program.id}>
                            <details>
                              <summary>
                                <span>{format(new Date(program.date), 'do MMMM yyyy')}</span>
                                <div>{program.program_details}</div>
                              </summary>
                              {program.session.map((session) => (
                                <div className="session">
                                  <div className="duration">
                                    <div className="time">
                                      {session.start_time.slice(0, -3)} -{' '}
                                      {session.end_time.slice(0, -3)}
                                    </div>
                                    <div className="venue">{session.venue}</div>
                                  </div>
                                  <div className="itinerary">
                                    <h4>{session.session_title}</h4>
                                    <div
                                      dangerouslySetInnerHTML={{ __html: session.html }}
                                      className="html"></div>
                                  </div>
                                </div>
                              ))}
                            </details>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    {event.inquiry.length > 0 ? (
                      <div className="inquiry">
                        <h4>
                          {t('about.events.eventsDetails.eventBody.inquiry_resources.title1')}
                        </h4>
                        {event.inquiry.map((inq) => (
                          <div key={inq.id}>
                            <span>{inq.inquiry}</span>: <span>{inq.role}</span> -{' '}
                            <span>{inq.email}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    {event.resource.length > 0 ? (
                      <div className="inquiry">
                        <h4>
                          {t('about.events.eventsDetails.eventBody.inquiry_resources.title2')}
                        </h4>
                        {event.resource.map((res) => (
                          <div key={res.id}>
                            {res.link || res.resource ? (
                              <a
                                href={res.link || res.resource}
                                target="_blank"
                                rel="noreferrer noopener"
                                download>
                                {res.title}
                              </a>
                            ) : (
                              <span className="no-link">{res.title}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              </div>
            ))}
        </>
      )}
    </PageMini>
  );
};

export default EventDetails;
