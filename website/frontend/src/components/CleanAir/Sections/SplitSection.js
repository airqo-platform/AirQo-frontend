import React from 'react';
import { Link } from 'react-router-dom';

const SplitSection = ({
  pillTitle,
  title,
  content,
  btnText,
  link,
  imgURL,
  reverse,
  bgColor,
  pillBgColor,
  pillTextColor,
  imageStyle,
  showButton
}) => {
  return (
    <div className="splitSection-section" style={{ backgroundColor: bgColor }}>
      <div className={` ${reverse ? 'backdrop-rev' : 'backdrop'}`}>
        <div className="splitSection-content">
          {pillTitle && (
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}>
              <span id="first-pill" style={{ backgroundColor: pillBgColor }}>
                <p style={{ color: pillTextColor }}>{pillTitle}</p>
              </span>
            </div>
          )}

          {title && <h3 className="content-h">{title}</h3>}
          <span className="content-p">{content}</span>
          {showButton && btnText && link && (
            <Link to={link} target="_blank">
              <span id="second-pill">
                <p>{btnText}</p>
              </span>
            </Link>
          )}
        </div>
        <div className="splitSection-image">
          <img className="splitSection-img" src={imgURL} style={imageStyle} />
        </div>
      </div>
    </div>
  );
};

SplitSection.defaultProps = {
  reverse: false,
  showButton: true,
  bgColor: '#FFFFFF',
  pillBgColor: '#ECF2FF',
  pillTextColor: '#135DFF',
  btnText: 'Read here -->'
};

export default SplitSection;
