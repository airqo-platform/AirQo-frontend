import React from 'react';
import { Link } from 'react-router-dom';

const ButtonCTA = ({ className, label, onClick, link, style }) => {
  return (
    <div className="hero-buttons">
      <Link to={link} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        <button className={className || 'button-hero'} style={style}>
          {label}
        </button>
      </Link>
    </div>
  );
};

export default ButtonCTA;
