import React from 'react';
import { SplitTextSection } from 'components/CleanAir';

const Index = ({ engagements, forumEvents }) => {
  return (
    <>
      {forumEvents[0].introduction_html && (
        <>
          <div className="separator" />
          <section className="about">
            <div className="intro">
              <div
                dangerouslySetInnerHTML={{
                  __html: forumEvents.length > 0 && forumEvents[0].introduction_html
                }}
              />
            </div>
          </section>
        </>
      )}
      {engagements && engagements.objectives.length > 0 && (
        <>
          <div className="separator" />
          <section className="about">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  {engagements.objectives.map((objective) => (
                    <div key={objective.id}>
                      <h3>{objective.title}</h3>
                      <p>{objective.details}</p>
                    </div>
                  ))}
                </div>
              }
              title={<h2 className="section_title">{engagements.title}</h2>}
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}
      <div className="separator" />
      <section className="about">
        <SplitTextSection
          lists={[]}
          content={
            <div className="engagements_list">
              This will be a largely in-person convening with limited hybrid sessions. You can{' '}
              <a href="https://forms.gle/Bkx2iHM4gMRTLQ757" target="_blank">
                register your interest here
              </a>{' '}
              and stay tuned for more details!{' '}
              <b>
                Attendance and participation is by invitation only, but there will be limited
                opportunities for abstract submissions
              </b>
              . Details on call for abstracts will be shared separately.
            </div>
          }
          title={<h2 className="section_title">Registration information</h2>}
          bgColor="#FFFFFF"
        />
      </section>

      <div className="separator" />
      <section className="about">
        <SplitTextSection
          lists={[]}
          content={
            <div className="engagements_list">
              <p style={{ paddingBottom: '15px' }}>
                We have put together flexible sponsorship packages including travel scholarships,
                session sponsorships, exhibitions, cocktail receptions and tailored options.
                Sponsorship will help optimize the cost of hosting the forum, and more importantly,
                support in-person participation of the target communities working for a clean air
                future in Africa. We thank our funding partners for the continued funding support
                and welcome more partners.
              </p>
              <p>
                Please get in touch with <a href="mailto:dokure@airqo.net">dokure@airqo.net</a> to
                discuss further details.
              </p>
            </div>
          }
          title={<h2 className="section_title">Sponsorship opportunities</h2>}
          bgColor="#FFFFFF"
        />
      </section>
    </>
  );
};

export default Index;
