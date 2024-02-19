import React from 'react';
import PropTypes from 'prop-types';
import ButtonCTA from '../CTAs/ButtonCTA';

const SingleSection = ({
  bgColor = 'transparent',
  btnText,
  padding = '1em',
  content,
  link,
  btnStyle,
  removeTopMargin = false
}) => (
  <div
    className={`single-section ${removeTopMargin ? 'no-top' : ''}`}
    style={{ backgroundColor: bgColor, padding }}>
    <div className="content">
      <div className="content-p">{content}</div>
      {btnText && link && (
        <div className="button">
          <ButtonCTA label={btnText} link={link} style={btnStyle} />
        </div>
      )}
    </div>
  </div>
);

SingleSection.propTypes = {
  bgColor: PropTypes.string,
  btnText: PropTypes.string,
  padding: PropTypes.string,
  content: PropTypes.any.isRequired,
  link: PropTypes.string,
  btnStyle: PropTypes.object,
  removeTopMargin: PropTypes.bool
};

export default SingleSection;
