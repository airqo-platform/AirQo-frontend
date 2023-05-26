import React, { memo } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import ArrowDown from 'icons/nav/ArrowDown';
import { Link } from 'react-router-dom';

// custom hook to handle external links
const useExternalLink = (path, onClick) => {
  const handleClick = (e) => {
    e.preventDefault();
    window.open(path, '_blank');
    if (onClick) onClick();
  };
  return handleClick;
};

const NavTab = ({ text, hideArrow, colored, filled, style, path, onClick, externalLink }) => {
  const handleExternalLink = useExternalLink(path, onClick);

  if (hideArrow) {
    if (externalLink) {
      return (
        <a
          href={path}
          className={classNames('NavTab', { filled })}
          style={{ textDecoration: 'none', color: '#fff', ...(style || {}) }}
          onClick={handleExternalLink}>
          {text}
        </a>
      );
    } else {
      return (
        <Link to={path || '/'} style={{ textDecoration: 'none', color: '#000' }}>
          <div
            className={classNames('NavTab', { colored, filled })}
            style={{ ...(style || {}) }}
            onClick={onClick}>
            <span>{text}</span>
          </div>
        </Link>
      );
    }
  } else {
    // arrow icon
    return (
      <div
        className={classNames('NavTab', { colored, filled })}
        style={{ ...(style || {}) }}
        onClick={onClick}>
        <span className="dropdown-text">{text}</span>
        <div className="arrow-down">
          <ArrowDown />
        </div>
      </div>
    );
  }
};

// setting the default props values
NavTab.propTypes = {
  text: PropTypes.string.isRequired,
  hideArrow: PropTypes.bool,
  colored: PropTypes.bool,
  filled: PropTypes.bool,
  style: PropTypes.object,
  path: PropTypes.string,
  onClick: PropTypes.func,
  externalLink: PropTypes.bool
};

// optimizing rendering with memo
export default memo(NavTab);
