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
  showButton,
  children,
  customBtn, wrapperPadding, titleSection
}) => {
  return (
    <div className={titleSection ? "splitSection-section title-section" : "splitSection-section"} style={{ backgroundColor: bgColor, padding: wrapperPadding }}>
      <div className={` ${reverse ? 'backdrop-rev' : 'backdrop'}`}>
        <div className="splitSection-content">
          {pillTitle && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}>
              <span id="first-pill" style={{ backgroundColor: pillBgColor }}>
                <p style={{ color: pillTextColor }}>{pillTitle}</p>
              </span>
            </div>
          )}

          {title && <h3 className="content-h">{title}</h3>}
          {content ? (
            <span className="content-p" dangerouslySetInnerHTML={{ __html: content }}></span>
          ) : (
            ''
          )}
          {children ? <span className="content-p">{children}</span> : ''}
          {showButton &&
            (customBtn ? (
              customBtn
            ) : (
              <Link to={link} target="_blank" style={{ marginTop: '15px' }}>
                <span id="second-pill">
                  <p>{btnText}</p>
                </span>
              </Link>
            ))}
        </div>
        <div className="splitSection-image">
          <img className="splitSection-img" src={imgURL} style={imageStyle} alt="" />
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
