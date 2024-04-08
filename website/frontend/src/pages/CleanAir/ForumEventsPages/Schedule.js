import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { SplitTextSection } from 'components/CleanAir';

/**
 * upArrow and downArrow components
 * @returns {React.Component}
 * @description SVG components for up and down arrows
 */
const upArrow = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 15L12 9L6 15"
        stroke="#536A87"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const downArrow = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9L12 15L18 9"
        stroke="#536A87"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Schedule = ({ schedule, registration }) => {
  const { t } = useTranslation();
  // Refs
  const wrapperRef = useRef(null);
  const [showAccordion, setShowAccordion] = useState(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowAccordion(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Use ternary operator for cleaner code
  const convertTime24to12 = (time24) => {
    let [hours, minutes] = time24.split(':');
    const modifier = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${modifier}`;
  };
  return (
    <>
      {schedule && schedule.length > 0 && (
        <>
          <div className="separator" />
          <section className="schedule">
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              {t('cleanAirSite.Forum.sections.schedule')}
            </h2>
            <div className="schedule" ref={wrapperRef}>
              {schedule.map((schedule) => (
                <div
                  className="event"
                  key={schedule.id}
                  onClick={() => setShowAccordion(schedule.id)}>
                  <div className="event-head">
                    <div>
                      <p className="date">{schedule.title}</p>
                      <p className="title">{schedule.program_details}</p>
                    </div>
                    <div>
                      {showAccordion === schedule.id ? (
                        <span>{upArrow()}</span>
                      ) : (
                        <span>{downArrow()}</span>
                      )}
                    </div>
                  </div>

                  {showAccordion === schedule.id &&
                    schedule.sessions.map((session, index) => (
                      <div key={session.id}>
                        <div className="event-details">
                          <div className="event-details__time">
                            <p>{convertTime24to12(session.start_time)}</p>
                          </div>
                          <div className="event-details__content">
                            <p className="title">{session.session_title}</p>
                            {session.html !== '<p><br></p>' && (
                              <p
                                className="description"
                                dangerouslySetInnerHTML={{ __html: session.html }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {registration && (
        <>
          <div className="separator" />
          <section className="about registration">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: registration }} />
                  </div>
                </div>
              }
              title={
                <h2 className="section_title"> {t('cleanAirSite.Forum.sections.registration')}</h2>
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* if both are empty */}
      {schedule.length === 0 && !registration && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}>
          No content available
        </div>
      )}
    </>
  );
};

export default Schedule;
