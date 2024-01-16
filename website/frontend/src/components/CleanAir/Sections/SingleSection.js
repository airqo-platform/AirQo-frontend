import React from 'react';
import ButtonCTA from '../CTAs/ButtonCTA';

const SingleSection = ({ bgColor, btnText, padding, content, link, btnStyle, removeTopMargin }) => {
  return (
    <div
      className={removeTopMargin ? 'single-section no-top' : 'single-section'}
      style={{ backgroundColor: bgColor, padding: padding }}>
      <div className="content">
        <span className="content-p">{content}</span>
        <div className="button">
          {btnText && link && <ButtonCTA label={btnText} link={link} style={btnStyle} />}
        </div>
      </div>
    </div>
  );
};

export default SingleSection;
