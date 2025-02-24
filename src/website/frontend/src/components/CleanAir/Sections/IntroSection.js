import React from 'react';

const RenderHTMLContent = ({ content }) =>
  /<[a-z][\s\S]*>/i.test(content) ? (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <p>{content}</p>
  );

const IntroSection = ({ subtext1, subtext2, image, imagePosition }) => (
  <div className="partners">
    <div className="partners-wrapper">
      <div className="membership-img-wrapper">
        <img
          src={image}
          alt="Membership"
          className="membership-img"
          style={{
            top: imagePosition
          }}
          loading="lazy"
        />
      </div>
      <div className="partners-intro">
        <RenderHTMLContent content={subtext1} />
        {subtext2 && <RenderHTMLContent content={subtext2} />}
      </div>
    </div>
  </div>
);

export default IntroSection;
