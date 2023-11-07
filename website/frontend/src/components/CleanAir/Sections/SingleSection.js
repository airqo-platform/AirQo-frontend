import React from 'react';
import ButtonCTA from '../CTAs/ButtonCTA';

const SingleSection = ({ bgColor, btnText, title, content, link, btnStyle }) => {
  return (
    <div className="single-section" style={{ backgroundColor: bgColor }}>
      <div className="content">
        {title && <h3 className="content-h">{title}</h3>}
        <span className="content-p">{content}</span>
        <div className="button">
          {btnText && link && <ButtonCTA label={btnText} link={link} style={btnStyle} />}
        </div>
      </div>
    </div>
  );
};

export default SingleSection;
