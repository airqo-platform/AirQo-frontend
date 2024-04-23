import React from 'react';
import { SplitTextSection } from 'components/CleanAir';
import { useTranslation, Trans } from 'react-i18next';

const Index = ({ engagements, forumEvents }) => {
  const { t } = useTranslation();
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
              <p style={{ marginBottom: '20px' }}>
                This will be a largely in-person convening with limited hybrid sessions. You can{' '}
                <a href="https://forms.gle/Bkx2iHM4gMRTLQ757" target="_blank">
                  register your interest here
                </a>{' '}
                and stay tuned for more details!{' '}
              </p>
              <p style={{ marginBottom: '20px' }}>
                <b>
                  Attendance and participation is by invitation only, but there will be limited
                  opportunities for abstract submissions
                </b>
              </p>
              <p>Details on call for abstracts will be shared separately.</p>
            </div>
          }
          title={
            <h2 className="section_title">
              Registration <br />
              information
            </h2>
          }
          bgColor="#FFFFFF"
        />
      </section>
      {forumEvents[0].sponsorship_details_html && (
        <>
          <div className="separator" />
          <section className="about">
            <h2 className="section_title">Sponsorship opportunities</h2>
            <div className="engagements_list">
              <div
                dangerouslySetInnerHTML={{
                  __html: forumEvents.length > 0 && forumEvents[0].sponsorship_details_html
                }}
              />
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Index;
