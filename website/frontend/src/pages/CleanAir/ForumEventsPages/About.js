import React from 'react';
import { SplitTextSection } from 'components/CleanAir';

const Index = ({ engagements, forumEvents }) => {
  return (
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
      {engagements && engagements.objectives.length > 0 && (
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
      )}

      {/* if both are empty */}
      {engagements && engagements.objectives.length === 0 && (
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

export default Index;
